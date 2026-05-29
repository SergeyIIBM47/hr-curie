export { Avatar, type AvatarSize } from "./avatar";
export { AvatarStack } from "./avatar-stack";
export { Pill, type PillVariant } from "./pill";
export { Sparkline, type SparklineTone } from "./sparkline";
export { Btn, type BtnVariant, type BtnSize } from "./btn";
export { IconBtn } from "./icon-btn";
export {
  IHome,
  IUser,
  IUsers,
  ILeave,
  ICal,
  ISettings,
  IStar,
  IBell,
  ISearch,
  IPlus,
  IArrowUp,
  IArrowDown,
  IArrowRight,
  IChevronLeft,
  IChevronRight,
  IClock,
  IPin,
  IMeeting,
  IDoc,
  ICake,
  type IconProps,
} from "./icons";

export { PageGreeting } from "./page-greeting";
export { KpiCard } from "./kpi-card";
export {
  WorkforceCompositionDonut,
  type WorkforceCount,
} from "./workforce-composition-donut";
export { MiniCalendar } from "./mini-calendar";

// Server-only (Prisma) components are NOT re-exported here so that
// client components can safely import primitives from "@/components/curie"
// without bundling the server-only modules. Import these from their
// individual files: "@/components/curie/<file>".
export type {
  OnboardingTrackerData,
  OnboardingStepView,
} from "./onboarding-tracker-card";
export type { NoticeView } from "./notice-board-card";
export type { ScheduleItem } from "./today-schedule-list";
