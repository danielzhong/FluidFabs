/**
 * Curated measurements transcribed from the original article tables, not generated data.
 * Checked 2026-09-29. All values retain their published precision and reported spread.
 * Missing measurement conditions stay null. Model assumptions must never fill these fields.
 */
export const LITERATURE_CHECKED_ON = "2026-09-29";
export interface ParticleObservation {
  id: string;
  particleId: string;
  particleLabel: string;
  particleLabelZh: string;
  formulation: string;
  medium: string;
  mediumZh: string;
  zetaMv: number;
  zetaSpreadMv: number;
  diameterNm: number;
  diameterSpreadNm: number;
  diameterBasis: string;
  diameterBasisZh: string;
  uncertaintyLabel: string;
  uncertaintyLabelZh: string;
  sourceId: string;
  ph: number | null;
  temperatureC: number | null;
  sampleCount: number | null;
  osmolalityMosmKg: number | null;
  particleConcentration: string | null;
  note: string;
  noteZh: string;
}
export const LITERATURE_SOURCES = {
  kolasinac2019: {
    authors: "Kolašinac et al.",
    year: 2019,
    title:
      "Influence of Environmental Conditions on the Fusion of Cationic Liposomes with Living Mammalian Cells",
    doi: "10.3390/nano9071025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6669649/",
    tableLabel: "Table 3",
    tableUrl:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC6669649/#nanomaterials-09-01025-t003",
    method:
      "Malvern Nano ZS; size by DLS and electrophoretic zeta characterization (§2.4). Reported mean peak positions and SD, three independent measurements. Table 3 uses water-hydrated liposome preparations (§3.3).",
    methodZh:
      "Malvern Nano ZS；DLS 粒径与电泳 ζ 电位表征（§2.4）。报告峰位均值及标准差，三次独立测量。表 3 使用水合于水中的脂质体制备方案（§3.3）。",
    conditions:
      "PBS pH 7.4 is stated in Table 3. Separate pH values for PB/glucose and the Table 3 measurement temperature are not explicit; those fields are left unreported. Osmolality is not ionic strength.",
    conditionsZh:
      "表 3 明确 PBS 的 pH 为 7.4；PB/葡萄糖各自的 pH 及表 3 测量温度未明确给出，保持未报告。渗透质量摩尔浓度不等同于离子强度。",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  skocaj2020: {
    authors: "Skočaj et al.",
    year: 2020,
    title:
      "Proposing Urothelial and Muscle In Vitro Cell Models as a Novel Approach for Assessment of Long-Term Toxicity of Nanoparticles",
    doi: "10.3390/ijms21207545",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7589566/",
    tableLabel: "Table 1",
    tableUrl:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC7589566/#ijms-21-07545-t001",
    method:
      "Malvern Nano ZS: DLS (173°) and M3-PALS (§4.2). Size here is the Z-average column, not the number-based diameter. The article-wide convention is mean ± standard error (§4.9); Table 1 does not separately specify the replicate count.",
    methodZh:
      "Malvern Nano ZS：DLS（173°）与 M3-PALS（§4.2）。这里使用 Z 均值列，不是按数量计的粒径列。§4.9 的全文统计约定为均值 ± 标准误；表 1 未单独注明重复次数。",
    conditions:
      "Water pH is reported per formulation in §2.1; MEM pH and characterization temperature are not specified. Samples: 0.05 w/w %. PEI in culture medium aggregated and partially sedimented; DLS describes the remaining stable fraction.",
    conditionsZh:
      "§2.1 按配方报告了水中 pH；MEM 的 pH 与表征温度未注明。样品浓度为 0.05 w/w %。PEI 在培养基中聚集并部分沉降，DLS 描述的是剩余稳定分散部分。",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
} as const;
const liposomeCommon = {
  sourceId: "kolasinac2019",
  diameterBasis: "DLS mean peak",
  diameterBasisZh: "DLS 峰位均值",
  uncertaintyLabel: "Mean ± SD; n = 3",
  uncertaintyLabelZh: "均值 ± 标准差；n = 3",
  temperatureC: null,
  sampleCount: 3,
  particleConcentration: null,
  note: "Research liposome preparation; no therapeutic drug cargo is specified in this table. Use within-study comparisons; preparation and dispersity matter.",
  noteZh:
    "研究用脂质体制备物；该表未指定治疗药物载荷。请优先进行同一研究内的比较，并考虑制备方法与分散性。",
};
const magneticCommon = {
  sourceId: "skocaj2020",
  diameterBasis: "DLS Z-average",
  diameterBasisZh: "DLS Z 均值",
  uncertaintyLabel: "Mean ± SE (article convention); n unreported",
  uncertaintyLabelZh: "均值 ± 标准误（全文约定）；n 未报告",
  temperatureC: null,
  sampleCount: null,
  osmolalityMosmKg: null,
  particleConcentration: "0.05 w/w %",
};
export const PARTICLE_OBSERVATIONS: readonly ParticleObservation[] = [
  {
    ...liposomeCommon,
    id: "fl-pb",
    particleId: "fl",
    particleLabel: "Fusogenic liposomes (FL)",
    particleLabelZh: "促融合脂质体（FL）",
    formulation: "DOPE/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "PB · 30 mOsm/kg",
    mediumZh: "磷酸盐缓冲液 PB · 30 mOsm/kg",
    zetaMv: 36,
    zetaSpreadMv: 6,
    diameterNm: 568,
    diameterSpreadNm: 145,
    ph: null,
    osmolalityMosmKg: 30,
  },
  {
    ...liposomeCommon,
    id: "fl-pbs",
    particleId: "fl",
    particleLabel: "Fusogenic liposomes (FL)",
    particleLabelZh: "促融合脂质体（FL）",
    formulation: "DOPE/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "PBS · 290 mOsm/kg",
    mediumZh: "磷酸盐缓冲盐水 PBS · 290 mOsm/kg",
    zetaMv: 28,
    zetaSpreadMv: 4,
    diameterNm: 567,
    diameterSpreadNm: 102,
    ph: 7.4,
    osmolalityMosmKg: 290,
  },
  {
    ...liposomeCommon,
    id: "fl-glucose30",
    particleId: "fl",
    particleLabel: "Fusogenic liposomes (FL)",
    particleLabelZh: "促融合脂质体（FL）",
    formulation: "DOPE/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "Glucose · 30 mOsm/kg",
    mediumZh: "葡萄糖 · 30 mOsm/kg",
    zetaMv: 72,
    zetaSpreadMv: 3,
    diameterNm: 537,
    diameterSpreadNm: 71,
    ph: null,
    osmolalityMosmKg: 30,
  },
  {
    ...liposomeCommon,
    id: "fl-glucose290",
    particleId: "fl",
    particleLabel: "Fusogenic liposomes (FL)",
    particleLabelZh: "促融合脂质体（FL）",
    formulation: "DOPE/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "Glucose · 290 mOsm/kg",
    mediumZh: "葡萄糖 · 290 mOsm/kg",
    zetaMv: 69,
    zetaSpreadMv: 11,
    diameterNm: 493,
    diameterSpreadNm: 157,
    ph: null,
    osmolalityMosmKg: 290,
  },
  {
    ...liposomeCommon,
    id: "el-pb",
    particleId: "el",
    particleLabel: "Endocytic liposomes (EL)",
    particleLabelZh: "内吞型脂质体（EL）",
    formulation: "DOPC/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "PB · 30 mOsm/kg",
    mediumZh: "磷酸盐缓冲液 PB · 30 mOsm/kg",
    zetaMv: 62,
    zetaSpreadMv: 1,
    diameterNm: 460,
    diameterSpreadNm: 277,
    ph: null,
    osmolalityMosmKg: 30,
  },
  {
    ...liposomeCommon,
    id: "el-pbs",
    particleId: "el",
    particleLabel: "Endocytic liposomes (EL)",
    particleLabelZh: "内吞型脂质体（EL）",
    formulation: "DOPC/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "PBS · 290 mOsm/kg",
    mediumZh: "磷酸盐缓冲盐水 PBS · 290 mOsm/kg",
    zetaMv: 36,
    zetaSpreadMv: 1,
    diameterNm: 551,
    diameterSpreadNm: 357,
    ph: 7.4,
    osmolalityMosmKg: 290,
  },
  {
    ...liposomeCommon,
    id: "el-glucose30",
    particleId: "el",
    particleLabel: "Endocytic liposomes (EL)",
    particleLabelZh: "内吞型脂质体（EL）",
    formulation: "DOPC/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "Glucose · 30 mOsm/kg",
    mediumZh: "葡萄糖 · 30 mOsm/kg",
    zetaMv: 78,
    zetaSpreadMv: 3,
    diameterNm: 524,
    diameterSpreadNm: 296,
    ph: null,
    osmolalityMosmKg: 30,
  },
  {
    ...liposomeCommon,
    id: "el-glucose290",
    particleId: "el",
    particleLabel: "Endocytic liposomes (EL)",
    particleLabelZh: "内吞型脂质体（EL）",
    formulation: "DOPC/DOTAP/TFPE-head, 1/1/0.1 mol/mol",
    medium: "Glucose · 290 mOsm/kg",
    mediumZh: "葡萄糖 · 290 mOsm/kg",
    zetaMv: 73,
    zetaSpreadMv: 7,
    diameterNm: 515,
    diameterSpreadNm: 357,
    ph: null,
    osmolalityMosmKg: 290,
  },
  {
    ...magneticCommon,
    id: "paa-water",
    particleId: "paa",
    particleLabel: "PAA-coated magnetic particles",
    particleLabelZh: "PAA 包覆磁性颗粒",
    formulation: "Polyacrylic-acid-coated cobalt ferrite",
    medium: "Distilled water",
    mediumZh: "蒸馏水",
    zetaMv: -56.3,
    zetaSpreadMv: 6,
    diameterNm: 138,
    diameterSpreadNm: 48,
    ph: 7.4,
    note: "Research cobalt-ferrite particles. The water suspension contains small aggregates; the published Z-average is an ensemble size.",
    noteZh: "研究用钴铁氧体颗粒。水中悬液含小聚集体；文献 Z 均值反映群体尺度。",
  },
  {
    ...magneticCommon,
    id: "paa-mem",
    particleId: "paa",
    particleLabel: "PAA-coated magnetic particles",
    particleLabelZh: "PAA 包覆磁性颗粒",
    formulation: "Polyacrylic-acid-coated cobalt ferrite",
    medium: "MEM α + 2% FCS",
    mediumZh: "MEM α + 2% 胎牛血清（FCS）",
    zetaMv: -25,
    zetaSpreadMv: 2,
    diameterNm: 573,
    diameterSpreadNm: 333,
    ph: null,
    note: "Polydisperse research suspension in protein-containing medium. Z-average and number-based sizes differ substantially; they are not interchangeable.",
    noteZh:
      "含蛋白介质中的多分散研究悬液。Z 均值和按数量计的粒径差异明显，不能互换。",
  },
  {
    ...magneticCommon,
    id: "pei-water",
    particleId: "pei",
    particleLabel: "PEI-coated magnetic particles",
    particleLabelZh: "PEI 包覆磁性颗粒",
    formulation: "Polyethylenimine-coated cobalt ferrite",
    medium: "Distilled water",
    mediumZh: "蒸馏水",
    zetaMv: 54.4,
    zetaSpreadMv: 4,
    diameterNm: 136,
    diameterSpreadNm: 25,
    ph: 6.6,
    note: "Research cobalt-ferrite particles, not an approved drug formulation. The water suspension contains small aggregates.",
    noteZh: "研究用钴铁氧体颗粒，不是获批药物制剂。水中悬液含小聚集体。",
  },
  {
    ...magneticCommon,
    id: "pei-mem",
    particleId: "pei",
    particleLabel: "PEI-coated magnetic particles",
    particleLabelZh: "PEI 包覆磁性颗粒",
    formulation: "Polyethylenimine-coated cobalt ferrite",
    medium: "MEM α + 2% FCS",
    mediumZh: "MEM α + 2% 胎牛血清（FCS）",
    zetaMv: -3,
    zetaSpreadMv: 1,
    diameterNm: 1352,
    diameterSpreadNm: 273,
    ph: null,
    note: "Aggregated and partially sedimented in medium. The reported DLS size represents the stable fraction, not the entire suspension (Table 1 footnote).",
    noteZh:
      "在培养基中发生聚集与部分沉降。原表 DLS 粒径只代表稳定分散部分，不代表整个悬液（表 1 脚注）。",
  },
];
