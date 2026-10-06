"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import type { AdminImportMappingDict } from "@/dictionaries/types";
import type { ImportError, ImportTableColumn } from "@/lib/data/types";
import type { SourceColumnMapping } from "@/lib/data/import/mapping";

/** A capped display row returned by the source-inspection API. */
export interface RegistrantColumnSampleRow {
  rowNumber: number;
  values: string[];
}

/** Props for the controlled source-column mapping workspace. */
export interface RegistrantColumnMapperProps {
  locale?: string;
  sourceColumns: readonly ImportTableColumn[];
  sampleRows: readonly RegistrantColumnSampleRow[];
  suggestedMapping: readonly SourceColumnMapping[];
  mapping: readonly SourceColumnMapping[];
  mappingErrors?: readonly ImportError[];
  loading?: boolean;
  disabled?: boolean;
  onMappingChange: (mapping: SourceColumnMapping[]) => void;
}

type TargetFieldKey = keyof AdminImportMappingDict["targetFields"];

const UNMAPPED_VALUE = "__unmapped__";

const TARGET_FIELDS: ReadonlyArray<{ key: TargetFieldKey; required: boolean }> = [
  { key: "nameZh", required: true },
  { key: "nameEn", required: true },
  { key: "email", required: true },
  { key: "phone", required: true },
  { key: "idDocNumber", required: true },
  { key: "idDocType", required: false },
  { key: "iaLicense", required: false },
  { key: "organization", required: false },
];

/** Convert a zero-based source position to the spreadsheet column label shown to admins. */
export function getSpreadsheetColumnLabel(sourceIndex: number): string {
  // 1: Convert the number to one-based base-26 letters (A…Z, AA…) without using header text.
  let remainder = sourceIndex + 1;
  let label = "";
  while (remainder > 0) {
    const digit = (remainder - 1) % 26;
    label = String.fromCharCode(65 + digit) + label;
    remainder = Math.floor((remainder - 1) / 26);
  }
  return label;
}

/** Mask personal data in sample cells after their source column is mapped to a sensitive target. */
export function maskMappedSample(targetField: string | undefined, value: string): string {
  // 1: Leave empty cells and nonsensitive fields unchanged for useful sample inspection.
  if (!value || !targetField) return value;

  // 2: Preserve only a small hint for email, phone, and identity-document values.
  if (targetField === "email") {
    const atIndex = value.lastIndexOf("@");
    return atIndex > 1 ? `${value[0]}•••${value.slice(atIndex)}` : "••••";
  }
  if (targetField === "phone" || targetField === "idDocNumber") {
    const compactValue = value.replace(/\s/g, "");
    if (compactValue.length <= 4) return "••••";
    const lastFour = compactValue.slice(-4);
    return lastFour ? `•••• ${lastFour}` : "••••";
  }

  return value;
}

/** Replace one destination mapping while preserving the one-source-to-one-target UI invariant. */
export function replaceSourceColumnMapping(
  currentMapping: readonly SourceColumnMapping[],
  targetField: string,
  selectedValue: string,
): SourceColumnMapping[] {
  // 1: Remove the destination's previous selection so an admin can change or clear it.
  const remaining = currentMapping.filter((entry) => entry.targetField !== targetField);
  if (!selectedValue || selectedValue === UNMAPPED_VALUE) return remaining;

  // 2: Preserve current state if an invalid or already-used source index is supplied.
  const sourceIndex = Number(selectedValue);
  if (!Number.isSafeInteger(sourceIndex)) return [...currentMapping];
  if (remaining.some((entry) => entry.sourceIndex === sourceIndex)) return [...currentMapping];

  return [...remaining, { sourceIndex, targetField }];
}

/** Determine an appropriate language tag for source text containing Han characters. */
function getSourceLanguage(value: string, locale: string): string | undefined {
  // 1: Leave Latin-only source values under the page language.
  if (!/\p{Script=Han}/u.test(value)) return undefined;

  // 2: Mark Chinese source text as Traditional or Simplified for assistive technology.
  return locale === "zh-cn" ? "zh-Hans" : "zh-Hant";
}

/** Render the approved Variant C mapping workspace as a controlled, localized component. */
export default function RegistrantColumnMapper({
  locale = "en",
  sourceColumns,
  sampleRows,
  suggestedMapping,
  mapping,
  mappingErrors = [],
  loading = false,
  disabled = false,
  onMappingChange,
}: RegistrantColumnMapperProps) {
  // 1: Resolve the admin dictionary and build lookup maps from source indices and target keys.
  const dict: AdminImportMappingDict = useAdminDict().importMapping;
  const mappingByTarget = new Map(mapping.map((entry) => [entry.targetField, entry.sourceIndex]));
  const targetBySource = new Map(mapping.map((entry) => [entry.sourceIndex, entry.targetField]));
  const suggestedByTarget = new Map(
    suggestedMapping.map((entry) => [entry.targetField, entry.sourceIndex]),
  );
  const requiredCount = TARGET_FIELDS.filter((field) => field.required).length;
  const mappedRequiredCount = TARGET_FIELDS.filter(
    (field) => field.required && mappingByTarget.has(field.key),
  ).length;
  const allRequiredMapped = mappedRequiredCount === requiredCount;
  const sampleColumns = sourceColumns;
  const visibleSamples = sampleRows.slice(0, 3);
  const targetKeys = new Set(TARGET_FIELDS.map((field) => field.key));
  const generalErrors = mappingErrors.filter((error) => !targetKeys.has(error.field as TargetFieldKey));

  // 2: Change one destination at a time and keep the mapping controlled by the wizard page.
  const handleTargetChange = (targetField: TargetFieldKey, value: string) => {
    // 1: Keep selection changes unique by source index and report them to the wizard owner.
    onMappingChange(replaceSourceColumnMapping(mapping, targetField, value));
  };

  // 3: Render mapping errors outside the target rows when no single field owns the message.
  return (
    <section className="w-full min-w-0 max-w-full" aria-labelledby="registrant-column-mapper-title" aria-busy={loading}>
      <Card className="w-full min-w-0 max-w-full gap-0 p-0">
        <CardHeader className="flex min-w-0 flex-col gap-3 border-b border-border px-6 py-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle id="registrant-column-mapper-title" className="text-base font-semibold">
              {dict.title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm">
              {dict.description}
            </CardDescription>
          </div>
          <Badge variant={allRequiredMapped ? "secondary" : "outline"} aria-live="polite">
            {dict.mappedSummary
              .replace("{mapped}", String(mappedRequiredCount))
              .replace("{required}", String(requiredCount))}
          </Badge>
        </CardHeader>

        <CardContent className="grid w-full min-w-0 grid-cols-1 gap-0 p-0 lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
          <section className="min-w-0 space-y-4 px-6 py-6" aria-labelledby="mapping-fields-title">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <h3 id="mapping-fields-title" className="text-sm font-semibold">
                {dict.destinations}
              </h3>
              <span className="text-xs text-muted-foreground">
                {allRequiredMapped ? dict.allRequiredMapped : dict.mappedSummary
                  .replace("{mapped}", String(mappedRequiredCount))
                  .replace("{required}", String(requiredCount))}
              </span>
            </div>

            {generalErrors.length > 0 && (
              <div
                role="alert"
                className="flex items-start gap-3 border-l-4 border-destructive bg-destructive/10 p-4 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{dict.mappingErrorTitle}</p>
                  <p className="mt-1">{dict.invalidMapping}</p>
                </div>
              </div>
            )}

            <div className="divide-y divide-border">
              {TARGET_FIELDS.map((field) => {
                const selectedSourceIndex = mappingByTarget.get(field.key);
                const fieldError = mappingErrors.find((error) => error.field === field.key);
                const isSuggested =
                  selectedSourceIndex !== undefined &&
                  suggestedByTarget.get(field.key) === selectedSourceIndex;
                const selectValue =
                  selectedSourceIndex === undefined
                    ? field.required
                      ? ""
                      : UNMAPPED_VALUE
                    : String(selectedSourceIndex);

                return (
                  <div key={field.key} className="space-y-2 border-b border-border py-3 last:border-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div id={`${field.key}-label`} className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{dict.targetFields[field.key]}</p>
                        <span className={field.required ? "text-xs font-medium text-destructive" : "text-xs text-muted-foreground"}>
                          {field.required ? dict.required : dict.optional}
                        </span>
                      </div>
                      {selectedSourceIndex !== undefined && (
                        <Badge variant={isSuggested ? "secondary" : "outline"} className="shrink-0">
                          {isSuggested ? dict.autoMatched : dict.manualMatch}
                        </Badge>
                      )}
                    </div>

                    <Select
                      value={selectValue}
                      onValueChange={(value) => handleTargetChange(field.key, value)}
                      disabled={disabled || loading || sourceColumns.length === 0}
                    >
                      <SelectTrigger
                        id={`${field.key}-source`}
                        aria-labelledby={`${field.key}-label`}
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={fieldError ? `${field.key}-error` : undefined}
                        className="h-11 w-full text-sm"
                      >
                        <SelectValue
                          placeholder={field.required ? dict.chooseSource : dict.leaveUnmapped}
                        />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {!field.required && (
                          <SelectItem value={UNMAPPED_VALUE}>{dict.leaveUnmapped}</SelectItem>
                        )}
                        {sourceColumns.map((column) => {
                          const assignedTarget = targetBySource.get(column.index);
                          const assignedElsewhere =
                            assignedTarget !== undefined && assignedTarget !== field.key;
                          const columnName = column.header.trim() || dict.blankHeader;

                          return (
                            <SelectItem
                              key={column.index}
                              value={String(column.index)}
                              disabled={assignedElsewhere}
                            >
                              {getSpreadsheetColumnLabel(column.index)} · {columnName}
                              {assignedElsewhere ? ` · ${dict.alreadyUsed}` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                      {fieldError && (
                        <p id={`${field.key}-error`} role="alert" className="text-xs text-destructive">
                          {field.required ? dict.requiredFieldError : dict.invalidMapping}
                        </p>
                      )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <p>{dict.optionalNote}</p>
              <p>{dict.duplicateNote}</p>
            </div>
          </section>

          <section
            className="w-full min-w-0 max-w-full border-t border-border px-6 py-6 lg:border-l lg:border-t-0"
            aria-labelledby="source-preview-title"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 id="source-preview-title" className="text-sm font-semibold">
                  {dict.sourcePreview}
                </h3>
                <p className="text-xs text-muted-foreground">{dict.samplePrivacy}</p>
              </div>
              <Badge variant="outline">{dict.sampleRows}</Badge>
            </div>

            {loading ? (
              <div role="status" className="flex min-h-32 items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {dict.loadingSamples}
              </div>
            ) : sampleColumns.length === 0 ? (
              <div role="status" className="flex min-h-32 items-center justify-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="size-4" aria-hidden="true" />
                {dict.noSourceColumns}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full min-w-0 max-w-full rounded-none border border-border" role="region" aria-label={dict.sourcePreview}>
                  <Table
                    className="min-w-max focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    tabIndex={0}
                    aria-label={dict.sourcePreview}
                  >
                    <TableCaption className="sr-only">{dict.sourcePreview}</TableCaption>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="sticky left-0 z-10 bg-muted">{dict.rowNumber}</TableHead>
                        {sampleColumns.map((column) => (
                          <TableHead
                            key={column.index}
                            className="min-w-36"
                            lang={getSourceLanguage(column.header, locale)}
                          >
                            {getSpreadsheetColumnLabel(column.index)} · {column.header.trim() || dict.blankHeader}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleSamples.map((sample) => (
                        <TableRow key={sample.rowNumber}>
                          <TableCell className="sticky left-0 z-10 bg-card font-medium">
                            {sample.rowNumber}
                          </TableCell>
                          {sampleColumns.map((column) => {
                            const targetField = targetBySource.get(column.index);
                            const rawValue = sample.values[column.index] ?? "";
                            const displayValue = maskMappedSample(targetField, rawValue);
                            return (
                              <TableCell
                                key={column.index}
                                className="max-w-56 truncate"
                                lang={getSourceLanguage(displayValue, locale)}
                              >
                                {displayValue || "—"}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {visibleSamples.length === 0 && (
                  <div role="status" className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
                    {dict.noSampleRows}
                  </div>
                )}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </section>
  );
}
