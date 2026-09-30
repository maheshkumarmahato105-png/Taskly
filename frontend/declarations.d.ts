declare namespace React {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => ReactNode;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useRef<T>(initialValue?: T): { current: T };
  export interface HTMLAttributes<T> {
    className?: string;
    style?: any;
    onClick?: (e: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    autoFocus?: boolean;
    title?: string;
  }
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: any;
    placeholder?: string;
    defaultValue?: any;
    onChange?: (e: any) => void;
    onKeyDown?: (e: any) => void;
    onInput?: (e: any) => void;
    disabled?: boolean;
    autoFocus?: boolean;
  }
  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
  }
  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
  }
  export interface ChangeEvent<T = Element> {
    target: T & { value: string; checked?: boolean };
  }
}

declare module "react" {
  export = React;
}

declare module "react-dom" {
  export function createPortal(children: any, container: any): any;
}

declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
  export interface NextConfig {
    [key: string]: any;
  }
}

declare module "next/link" {
  import type { ReactNode } from "react";
  export interface LinkProps {
    href: string;
    className?: string;
    children?: ReactNode;
    onClick?: (e: any) => void;
    [key: string]: any;
  }
  export default function Link(props: LinkProps): any;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
  };
  export function useSearchParams(): {
    get(name: string): string | null;
  };
}

declare module "lucide-react" {
  import type { FC } from "react";
  export interface IconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
    style?: any;
    [key: string]: any;
  }
  export type Icon = FC<IconProps>;

  export const LayoutGrid: Icon;
  export const Circle: Icon;
  export const Clock3: Icon;
  export const CheckCircle2: Icon;
  export const AlertTriangle: Icon;
  export const AlertCircle: Icon;
  export const ShieldAlert: Icon;
  export const ListChecks: Icon;
  export const CalendarClock: Icon;
  export const Settings: Icon;
  export const Pencil: Icon;
  export const Trash2: Icon;
  export const X: Icon;
  export const Check: Icon;
  export const Search: Icon;
  export const Plus: Icon;
  export const Bell: Icon;
  export const HelpCircle: Icon;
  export const ChevronDown: Icon;
  export const MoreHorizontal: Icon;
  export const UserRound: Icon;
  export const Users: Icon;
  export const BookOpen: Icon;
  export const BriefcaseBusiness: Icon;
  export const CircleAlert: Icon;
  export const ClipboardList: Icon;
  export const FileEdit: Icon;
  export const LayoutDashboard: Icon;
  export const Menu: Icon;
  export const WalletCards: Icon;
}
