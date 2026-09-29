export const benefits = [
  {
    icon: "sliders",
    tag: "ORGANIZE BY ZETA POTENTIAL",
    title: "Start with a clearer comparison.",
    text: "Group published particle observations by zeta potential range. Keep the source, measurement conditions, and reported uncertainty in view when comparing media.",
    detail: "Published measurements with source context",
    visual: "charge",
    zh: {
      tag: "按 Zeta 电位分组",
      title: "让比较有据可循。",
      text: "按 Zeta 电位范围组织文献中的颗粒观测，在比较介质时保留来源、测量条件和原文报告的不确定性。",
      detail: "带有来源背景的文献实测值",
    },
  },
  {
    icon: "mix",
    tag: "COMPARE THE ENVIRONMENT",
    title: "Change the conditions. Explore the response.",
    text: "Compare measurements across solution media, then explore diffusion scenarios using a reported particle size, assumed viscosity, and a reference length. Each step keeps evidence separate from calculation.",
    detail: "Measured inputs. Explicit model assumptions.",
    visual: "environment",
    zh: {
      tag: "比较不同环境",
      title: "改变条件，探索响应。",
      text: "先比较不同介质中的实测值，再使用文献粒径、假设黏度和参考长度探索扩散情景，清楚区分证据与计算。",
      detail: "实测输入，明确的模型假设",
    },
  },
  {
    icon: "scan",
    tag: "MAKE BEHAVIOR VISIBLE",
    title: "See the pattern. Plan the experiment.",
    text: "Bring concentration profiles and diffusion times into a shared visual workspace. Illustrative models help teams discuss assumptions and plan what to measure next.",
    detail: "Visual context for experimental planning",
    visual: "profiles",
    zh: {
      tag: "让颗粒行为可视化",
      title: "看清变化，规划实验。",
      text: "在同一个可视化界面中呈现浓度分布和扩散时间。示意模型帮助团队讨论假设，并规划下一步需要测量什么。",
      detail: "为实验规划提供直观参考",
    },
  },
];

export const steps = [
  {
    number: "01",
    icon: "sliders",
    title: "Characterize the system.",
    text: "Review published particle properties, zeta potential measurements, and their experimental conditions. Identify which observations fit the research question and which measurements are still needed.",
    note: "Research question → measurement plan",
    zh: {
      title: "测量与表征。",
      text: "查阅已发表的颗粒性质、Zeta 电位测量及实验条件，判断哪些观测与研究问题相关，以及仍需开展哪些测量。",
      note: "研究问题 → 测量计划",
    },
  },
  {
    number: "02",
    icon: "mix",
    title: "Model the scenarios.",
    text: "Use selected literature sizes to explore idealized concentration changes and diffusion times. Record assumed viscosity, temperature, and reference length without treating them as reported measurement conditions.",
    note: "Defined conditions → comparable scenarios",
    zh: {
      title: "构建情景模型。",
      text: "选用文献粒径，探索理想化浓度变化与扩散时间。记录假设黏度、温度和参考长度，并将这些假设与原文测量条件区分开。",
      note: "明确条件 → 可比较的情景",
    },
  },
  {
    number: "03",
    icon: "scan",
    title: "Calibrate through experiments.",
    text: "The next development step is to compare model outputs with experimental measurements, refine parameters, and evaluate where the model applies before extending its use.",
    note: "Experimental evidence → model refinement",
    zh: {
      title: "通过实验校准。",
      text: "下一阶段将把模型输出与实验测量对照，修正参数，并在拓展用途之前评估模型的适用范围。",
      note: "实验证据 → 模型优化",
    },
  },
];

export const faqs = [
  {
    question: "What is Fluid Fabs building?",
    answer:
      "We are developing a particle-modeling platform for biotech R&D, connecting published measurements with transparent modeling scenarios. The current literature preview contains research liposomes and magnetic particles; it is not a catalog of approved drugs. The wider goal is to help teams frame and test questions about particle transport.",
    zh: {
      question: "Fluid Fabs 正在开发什么？",
      answer:
        "我们正在开发面向生物科技研发的颗粒建模平台，将已发表的测量数据与假设明确的建模情景连接起来。当前文献预览包含研究用脂质体和磁性颗粒，并非获批药物目录。更长远的目标是帮助团队提出并检验颗粒传输问题。",
    },
  },
  {
    question: "Does the explorer show experimental results?",
    answer:
      "The literature preview shows zeta potential and particle-size measurements published by other researchers. The concentration curves and diffusion times are separate illustrative calculations using selected literature sizes and assumed viscosity, temperature, and reference length. Fluid Fabs has not experimentally validated these curves, and they do not establish clinical performance.",
    zh: {
      question: "交互模型展示的是实验结果吗？",
      answer:
        "文献预览展示其他研究者发表的 Zeta 电位和粒径实测值。浓度曲线与扩散时间则是独立的示意计算，使用选定文献粒径以及假设黏度、温度和参考长度。Fluid Fabs 尚未通过实验验证这些曲线，它们也不代表临床表现。",
    },
  },
  {
    question: "Is zeta potential enough to describe particle behavior?",
    answer:
      "Zeta potential is an organizing dimension for comparing particle systems. Particle properties, solution conditions, and the assumptions of each model also matter. A zeta potential range alone does not establish how a drug particle will behave in an experiment or in the body.",
    zh: {
      question: "仅凭 Zeta 电位就能描述颗粒行为吗？",
      answer:
        "Zeta 电位是组织和比较颗粒体系的一个维度，颗粒性质、溶液条件以及模型假设同样重要。仅凭一个电位范围，无法确定药物颗粒在实验或人体中的实际行为。",
    },
  },
  {
    question: "What could a research pilot involve?",
    answer:
      "A pilot discussion starts with your research question, available measurements, and the conditions you want to compare. Together, we can scope a modeling question and an experimental evaluation plan. We are inviting biotech teams interested in helping shape this early-stage platform.",
    zh: {
      question: "研究试点可以如何开展？",
      answer:
        "试点讨论从你的研究问题、已有测量数据和希望比较的条件开始。我们可以一起明确建模问题及实验评估计划，欢迎有兴趣共同完善这一早期平台的生物科技团队交流。",
    },
  },
  {
    question: "How will the models be evaluated?",
    answer:
      "The planned path is to compare model outputs with experimental measurements, document discrepancies, and refine model parameters. Evaluating performance across relevant conditions and documenting limits will be necessary before drawing stronger conclusions from the models.",
    zh: {
      question: "将如何评估模型？",
      answer:
        "计划中的路径是将模型输出与实验测量对照，记录差异并优化参数。在依据模型作出更强的结论之前，需要评估其在相关条件下的表现，并明确局限性。",
    },
  },
  {
    question: "How does this connect to future clinical research?",
    answer:
      "Our near-term focus is research modeling and experimental validation. Future clinical research is a separate, longer-term direction that would require further evidence, specialist collaboration, and study-specific review. The current demonstration does not establish clinical suitability or support treatment decisions.",
    zh: {
      question: "这与未来临床研究有什么联系？",
      answer:
        "近期重点是科研建模与实验验证。未来临床研究是独立的长期方向，需要进一步的证据、专业合作和针对具体研究的评审。当前演示不代表已具备临床适用性，也不用于治疗决策。",
    },
  },
];
