export type Theme = "light" | "dark";

export type SqlDialect = "postgres" | "mysql" | "sqlite";

export interface SqlConfig {
  tableName: string;
  dialect: SqlDialect;
  includeDrop: boolean;
  includeCreate: boolean;
  useBatch: boolean;
}

export interface ActionItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}
