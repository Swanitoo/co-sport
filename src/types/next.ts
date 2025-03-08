export interface PageParams<T = {}> {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
}

export type LayoutParams<T extends Record<string, string | string[]>> = {
  children: React.ReactNode;
  params: T;
};
