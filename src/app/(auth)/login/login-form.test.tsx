import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { LoginForm } from "./login-form";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const signInMock = vi.mocked(signIn);
const fetchMock = vi.fn();
const locationAssign = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  signInMock.mockReset();
  locationAssign.mockReset();
  global.fetch = fetchMock;
  vi.spyOn(console, "error").mockImplementation(() => {});

  // Prevent jsdom "not implemented" error on navigation
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "http://localhost:3000", assign: locationAssign },
  });
});

function mockRateLimitCheck(status: number) {
  fetchMock.mockResolvedValueOnce({
    ok: status < 400,
    status,
    json: () => Promise.resolve(status === 429 ? { error: "rate limited" } : { ok: true }),
  });
}

function signInResult(overrides: Partial<Awaited<ReturnType<typeof signIn>>> = {}) {
  return {
    error: undefined,
    code: undefined,
    status: 200,
    ok: true,
    url: "http://localhost:3000/",
    ...overrides,
  };
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("LoginForm", () => {
  describe("render", () => {
    it("renders email input with placeholder", () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });

    it("renders password input with type=password", () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText("Password")).toHaveAttribute(
        "type",
        "password",
      );
    });

    it('renders "Sign In" button', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it('renders "HR Curie" heading', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole("heading", { name: /hr curie/i }),
      ).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("does not submit when form is empty", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(signInMock).not.toHaveBeenCalled();
    });

    it("does not submit with invalid email", async () => {
      render(<LoginForm />);
      await fillAndSubmit("not-an-email", "password123");

      expect(fetchMock).not.toHaveBeenCalled();
      expect(signInMock).not.toHaveBeenCalled();
    });

    it("signs in with normalized email for valid data", async () => {
      mockRateLimitCheck(200);
      signInMock.mockResolvedValue(signInResult());

      render(<LoginForm />);
      await fillAndSubmit("Sofia@Company.COM", "password123");

      await waitFor(() => {
        expect(signInMock).toHaveBeenCalledWith("credentials", {
          email: "sofia@company.com",
          password: "password123",
          redirect: false,
        });
      });

      const [rateLimitUrl] = fetchMock.mock.calls[0];
      expect(rateLimitUrl).toBe("/api/auth/rate-limit");
    });
  });

  describe("password toggle", () => {
    it("toggles input type between password and text on eye icon click", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText("Password");
      const toggleButton = screen
        .getAllByRole("button")
        .find((btn) => btn.getAttribute("type") === "button")!;

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("loading state", () => {
    it("disables button and hides Sign In text while submitting", async () => {
      mockRateLimitCheck(200);
      let resolveSignIn!: (value: unknown) => void;
      signInMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSignIn = resolve;
          }) as never,
      );

      render(<LoginForm />);
      await fillAndSubmit("test@example.com", "password123");

      const submitButton = screen
        .getAllByRole("button")
        .find((btn) => btn.getAttribute("type") === "submit")!;
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();

      resolveSignIn(signInResult());
    });

    it("re-enables button after a failed sign-in", async () => {
      mockRateLimitCheck(200);
      signInMock.mockResolvedValue(
        signInResult({ error: "CredentialsSignin", ok: false, status: 401, url: null }),
      );

      render(<LoginForm />);
      await fillAndSubmit("test@example.com", "password123");

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /sign in/i }),
        ).not.toBeDisabled();
      });
    });
  });

  describe("error display", () => {
    it("shows an error when credentials are rejected", async () => {
      mockRateLimitCheck(200);
      signInMock.mockResolvedValue(
        signInResult({ error: "CredentialsSignin", ok: false, status: 401, url: null }),
      );

      render(<LoginForm />);
      await fillAndSubmit("sofia@company.com", "wrong-pass");

      expect(
        await screen.findByText(/invalid email or password/i),
      ).toBeInTheDocument();
      expect(locationAssign).not.toHaveBeenCalled();
    });

    it("shows the lockout message and skips sign-in when rate limited", async () => {
      mockRateLimitCheck(429);

      render(<LoginForm />);
      await fillAndSubmit("sofia@company.com", "password123");

      expect(
        await screen.findByText(/too many login attempts/i),
      ).toBeInTheDocument();
      expect(signInMock).not.toHaveBeenCalled();
    });

    it("navigates to the dashboard and shows no error on success", async () => {
      mockRateLimitCheck(200);
      signInMock.mockResolvedValue(signInResult());

      render(<LoginForm />);
      await fillAndSubmit("sofia@company.com", "password123");

      await waitFor(() => {
        expect(locationAssign).toHaveBeenCalledWith("/");
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears error message when retrying submission", async () => {
      mockRateLimitCheck(200);
      signInMock.mockResolvedValueOnce(
        signInResult({ error: "CredentialsSignin", ok: false, status: 401, url: null }),
      );

      render(<LoginForm />);
      await fillAndSubmit("sofia@company.com", "wrong-pass");

      expect(
        await screen.findByText(/invalid email or password/i),
      ).toBeInTheDocument();

      mockRateLimitCheck(200);
      signInMock.mockResolvedValueOnce(signInResult());

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid email or password/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});
