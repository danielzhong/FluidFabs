import {
  PARTICLE_OBSERVATIONS,
  LITERATURE_SOURCES,
  LITERATURE_CHECKED_ON,
} from "../../content/literature/particles";
export function GET() {
  return new Response(
    JSON.stringify(
      {
        checkedOn: LITERATURE_CHECKED_ON,
        description:
          "Selected published measurements; not Fluid Fabs measurements, a drug catalog, or model predictions. Null means not explicitly reported for this measurement. See source-specific uncertainty and size definitions.",
        sources: LITERATURE_SOURCES,
        observations: PARTICLE_OBSERVATIONS,
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
