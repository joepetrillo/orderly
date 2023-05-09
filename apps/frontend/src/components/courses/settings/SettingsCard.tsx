import { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

export default function SettingsCard({
  children,
  error,
  headerTitle,
  buttonTitle,
  customButton,
  description,
  loading,
  danger,
  onSubmit = (e) => e.preventDefault(),
}: {
  children?: React.ReactNode;
  error?: string;
  headerTitle: string;
  buttonTitle?: string;
  customButton?: React.ReactNode;
  description: string;
  loading: boolean;
  danger?: boolean;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
  return (
    <div
      className={cn(
        "max-w-screen-md overflow-hidden rounded border bg-white",
        danger ? "border-red-300" : "border-gray-200"
      )}
    >
      <fieldset disabled={loading}>
        <form onSubmit={onSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="font-semibold">{headerTitle}</h3>
            {children && <div className="mt-5 sm:mt-6">{children}</div>}
            {error && <p className="mt-5 text-xs text-red-500">{error}</p>}
          </div>
          <div
            className={cn(
              "flex flex-col items-start gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
              danger ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
            )}
          >
            <p
              className={cn(
                "text-sm",
                danger ? "text-red-500" : "text-gray-700"
              )}
            >
              {description}
            </p>
            {customButton ? (
              customButton
            ) : (
              <Button size="sm">
                {buttonTitle} {loading && <Spinner small />}
              </Button>
            )}
          </div>
        </form>
      </fieldset>
    </div>
  );
}
