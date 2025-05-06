export interface PageParams<T = {}> {
  params: Promise<T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export type LayoutParams<T extends Record<string, string | string[]>> = {
  children: React.ReactNode;
  params: Promise<T>;
};
