import {
  PARTICLE_OBSERVATIONS,
  LITERATURE_SOURCES,
  LITERATURE_CHECKED_ON,
} from "../../content/literature/particles";
export function GET() {
  const fields = [
    "id",
    "particleLabel",
    "formulation",
    "medium",
    "zetaMv",
    "zetaSpreadMv",
    "diameterNm",
    "diameterSpreadNm",
    "diameterBasis",
    "uncertaintyLabel",
    "ph",
    "temperatureC",
    "sampleCount",
    "osmolalityMosmKg",
    "particleConcentration",
    "note",
  ] as const;
  const quote = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = PARTICLE_OBSERVATIONS.map((record) => {
    const source =
      LITERATURE_SOURCES[record.sourceId as keyof typeof LITERATURE_SOURCES];
    return [
      ...fields.map((field) => record[field]),
      source.doi,
      source.tableLabel,
      source.tableUrl,
      source.conditions,
      LITERATURE_CHECKED_ON,
    ]
      .map(quote)
      .join(",");
  });
  const csv =
    "\uFEFF" +
    [
      [
        ...fields,
        "doi",
        "sourceTable",
        "sourceUrl",
        "sourceConditions",
        "checkedOn",
      ]
        .map(quote)
        .join(","),
      ...rows,
    ].join("\r\n") +
    "\r\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
