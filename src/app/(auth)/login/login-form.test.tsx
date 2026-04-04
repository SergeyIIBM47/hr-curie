import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  fetchMock.mockReset();
  global.fetch = fetchMock;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});

  // Prevent jsdom "not implemented" error on window.location.href assignment
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "http://localhost:3000" },
  });
});

function mockCsrfAndCredentials(credentialsResponse: Record<string, unknown>) {
  fetchMock
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ csrfToken: "test-csrf" }),
    })
    .mockResolvedValueOnce(credentialsResponse);
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
    it("does not call fetch when form is submitted empty", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not call fetch with invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByPlaceholderText("Email"), "not-an-email");
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("calls fetch with correct endpoint and body for valid data", async () => {
      const user = userEvent.setup();
      mockCsrfAndCredentials({
        status: 0,
        type: "opaqueredirect",
        ok: false,
        headers: new Headers(),
      });

      render(<LoginForm />);

      await user.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/auth/csrf");

      const [url, options] = fetchMock.mock.calls[1];
      expect(url).toBe("/api/auth/callback/credentials");
      expect(options.method).toBe("POST");

      const body = new URLSearchParams(String(options.body));
      expect(body.get("email")).toBe("test@example.com");
      expect(body.get("password")).toBe("password123");
      expect(body.get("csrfToken")).toBe("test-csrf");
      expect(body.get("callbackUrl")).toBe("/");
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
      const user = userEvent.setup();

      let resolveCredentials!: (value: unknown) => void;
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ csrfToken: "test-csrf" }),
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveCredentials = resolve;
            }),
        );

      render(<LoginForm />);

      await user.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();

      resolveCredentials({
        status: 0,
        type: "opaqueredirect",
        ok: false,
        headers: new Headers(),
      });
    });

    it("re-enables button after error response", async () => {
      const user = userEvent.setup();
      mockCsrfAndCredentials({
        ok: false,
        status: 500,
        type: "default",
        text: () => Promise.resolve("Error"),
        headers: new Headers(),
      });

      render(<LoginForm />);

      await user.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /sign in/i }),
        ).not.toBeDisabled();
      });
    });
  });

  describe("error display", () => {
    it("displays error message when fetch returns error status", async () => {
      const user = userEvent.setup();
      mockCsrfAndCredentials({
        ok: false,
        status: 500,
        type: "default",
        text: () => Promise.resolve("Internal error"),
        headers: new Headers(),
      });

      render(<LoginForm />);

      await user.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error \(500\)/i)).toBeInTheDocument();
      });
    });

    it("clears error message when retrying submission", async () => {
      const user = userEvent.setup();

      // First attempt: error
      mockCsrfAndCredentials({
        ok: false,
        status: 500,
        type: "default",
        text: () => Promise.resolve("Error"),
        headers: new Headers(),
      });

      render(<LoginForm />);

      await user.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com",
      );
      await user.type(screen.getByPlaceholderText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error \(500\)/i)).toBeInTheDocument();
      });

      // Second attempt: queue new fetch mocks
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ csrfToken: "test-csrf-2" }),
        })
        .mockResolvedValueOnce({
          status: 0,
          type: "opaqueredirect",
          ok: false,
          headers: new Headers(),
        });

      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText(/server error/i)).not.toBeInTheDocument();
      });
    });
  });
});
