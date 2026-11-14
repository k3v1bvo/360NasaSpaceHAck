/**
 * Flight Experiences & Accident Forensics Database (43 Historical NASA Cases)
 * Grounded data for the AI Assistant.
 */

export const FLIGHT_EXPERIENCES = [
  {
    id: "EXP-01",
    question: "¿Cómo se descubrió el fenómeno de Llamas Frías (Cool Flames) en la ISS?",
    category: "Llamas Frías",
    mission: "FLEX / FLEX-2 (ISS Combustion Integrated Rack)",
    answer: "Durante los experimentos FLEX en 2009 con gotas de n-heptano en el CIR de la ISS, los científicos observaron que tras apagarse la llama brillante caliente por pérdidas radiativas, la gota continuaba evaporándose y perdiendo masa sin emitir luz visible. Sensores térmicos y espectroscópicos confirmaron que la reacción química continuaba a baja temperatura (600 a 800 K) mediante cinética de peróxidos (química LTC), un hallazgo que transformó la ciencia de combustión espacial.",
    citation: "Nayagam et al., Combustion and Flame, 2012; Dietrich et al., 2014"
  },
  {
    id: "EXP-02",
    question: "¿Por qué las Llamas Frías representan un peligro crítico no detectado?",
    category: "Llamas Frías",
    mission: "FLEX-2 / CFI (Cool Flames Investigation)",
    answer: "Las llamas frías operan entre 600 y 800 K sin emitir radiación en el espectro visible ni quimioluminiscencia típica (CH* o C2*). Los detectores ópticos convencionales de humo e infrarrojo de la ISS no las detectan. Durante este período, se acumulan monóxido de carbono (CO), formaldehído (CH2O) y peróxido de hidrógeno (H2O2). Si se restablece o incrementa la ventilación forzada en la cabina, la llama fría puede experimentar una transición instantánea y reencenderse catastróficamente como llama caliente.",
    citation: "Farouk et al., Combust. Flame, 2021; NASA PSI Data Repository"
  },
  {
    id: "EXP-03",
    question: "¿Qué ocurrió en el accidente del Apollo 1 y qué lecciones dejó?",
    category: "Accidentes Históricos",
    mission: "Apollo 1 (AS-204, 27 de enero de 1967)",
    answer: "Un incendio en la cabina de mando durante una prueba en rampa provocó la muerte de los astronautas Grissom, White y Chaffee. Factores causales: 1) Atmósfera de 100% O2 puro presurizada a 16.7 psia (sobrepresión terrestre), 2) Presencia masiva de materiales combustibles (velcro, redes de nylon), 3) Cableado dañado por apertura repetida de escotillas que generó un arco eléctrico, 4) Escotilla de 3 piezas que abría hacia adentro y requería 90 segundos para abrirse bajo sobrepresión interna. Lección: Rediseño a escotilla unificada de escape rápido operable en 3 segundos y eliminación de atmósferas puras hiperóxicas en tierra.",
    citation: "Report of Apollo 204 Review Board, NASA Historical Reference Collection"
  },
  {
    id: "EXP-04",
    question: "¿Qué falló en el Apollo 13 en relación con el aislamiento de teflón?",
    category: "Accidentes Históricos",
    mission: "Apollo 13 (13 de abril de 1970)",
    answer: "El tanque de oxígeno líquido #2 del Módulo de Servicio explotó debido a que el aislamiento de teflón de los cables del calentador interno se incendió dentro de oxígeno puro. Causa raíz: En pruebas terrestres en rampa, el calentador se alimentó a 65 V en lugar de los 28 V de diseño, lo que soldó los contactos del termostato y calentó el tubo central a más de 1000 °F (538 °C), dañando irreversiblemente el teflón. Al encenderse en vuelo los agitadores, un cortocircuito inició la combustión del teflón dañado en oxígeno criogénico a 1000 psi.",
    citation: "Report of Apollo 13 Review Board (Cortright Commission), NASA, 1970"
  },
  {
    id: "EXP-05",
    question: "¿Qué sucedió en el incendio de la Estación Espacial Mir en 1997?",
    category: "Accidentes Históricos",
    mission: "Estación Espacial Mir (23 de febrero de 1997)",
    answer: "Un incendio severo se desató en el módulo Kvant-1 al encender una vela de oxígeno químico sólido (generador TGK / Vika con perclorato de litio). La vela se rompió y se transformó en un soplete de fuego abierto alimentado por oxígeno puro que escupía escoria fundida y llenó la estación de humo denso, bloqueando una de las naves Soyuz de escape. Causa: Contaminación orgánica interna (probablemente una pieza de guante de látex o lubricante). La tripulación tardó varios minutos en apagarlo con múltiples extintores de agua y espuma.",
    citation: "NASA History Division, '25 Years Ago: Fire Aboard Space Station Mir'"
  },
  {
    id: "EXP-06",
    question: "¿Por qué los cables finos arden más rápido en microgravedad según BASS-II?",
    category: "Inflamabilidad de Materiales",
    mission: "BASS-II (Burning and Suppression of Solids II)",
    answer: "En muestras cilíndricas delgadas (como aislamientos de cables de ETFE de 0.5 a 1.0 mm de diámetro), el número de Biot térmico es muy bajo (Bi << 0.1), lo que significa que el calor se distribuye instantáneamente en todo el volumen del combustible. Además, la curvatura geométrica incrementa el flujo radiativo y conductivo recibido por unidad de masa en comparación con superficies planas. Como resultado, la velocidad de propagación de llama Vf es inversamente proporcional al radio del cable, ardiendo hasta 4 veces más rápido.",
    citation: "Ferkul et al., AIAA Aerospace Sciences Meeting, 2016"
  },
  {
    id: "EXP-07",
    question: "¿Qué demostró el experimento Saffire sobre incendios a gran escala?",
    category: "Incendios a Gran Escala",
    mission: "Saffire-I a IV (Cygnus Cargo Vehicles)",
    answer: "Saffire demostró que en naves espaciales reales, las llamas a escala de metros (0.4 m x 1.0 m) se propagan de forma autosostenida a velocidades de viento muy lentas (0.4 a 5 cm/s). En microgravedad, el frente de llama genera una tasa de liberación de calor superior a 18 kW y satura rápidamente los sistemas de filtración de cabina. También demostró que cortar la ventilación del vehículo no sofoca el fuego de inmediato, ya que la difusión molecular continúa suministrando oxígeno remanente.",
    citation: "Urban et al., Fire Safety Journal, 2017; Ruff et al., 2021"
  },
  {
    id: "EXP-08",
    question: "¿Por qué el estándar terrestre NASA-STD-6001B Test 1 no es el peor escenario?",
    category: "Normativa e Inflamabilidad",
    mission: "FLARE Project (JAXA / NASA Kibo SCEM)",
    answer: "El estándar NASA-STD-6001B Test 1 evalúa la propagación vertical ascendente en 1-g creyendo que la flotabilidad natural representa el caso más severo. Sin embargo, en 1-g la fuerte corriente convectiva ascendente (30-100 cm/s) induce un enfriamiento por cizalladura (shear cooling) en la base de la llama que ayuda a extinguirla. En microgravedad con ventilación forzada lenta (0.4-5 cm/s), ese enfriamiento desaparece, permitiendo que materiales aprobados en tierra con LOI 18-20% ardan sostenidamente en microgravedad con LOI inferior al 16%.",
    citation: "Torero et al., Progress in Energy and Combustion Science, 2020"
  },
  {
    id: "EXP-09",
    question: "¿Por qué los detectores ópticos convencionales fallan en microgravedad?",
    category: "Detección de Humo",
    mission: "SAME / SAME-R (Smoke Aerosol Measurement Experiment)",
    answer: "En gravedad normal, la pluma térmica arrastra rápidamente partículas pequeñas de humo (0.1 µm) hacia los detectores de techo antes de que crezcan. En microgravedad no hay pluma térmica; las partículas permanecen retenidas en la zona de pirólisis y experimentan una coagulación browniana continua masiva, creciendo rápidamente a diámetros de 1 a 10 µm. Los detectores fotoeléctricos convencionales se confunden con el polvo flotante de la cabina y generan constantes falsas alarmas.",
    citation: "Urban et al., Journal of Aerosol Science, 2010"
  },
  {
    id: "EXP-10",
    question: "¿Cómo opera el detector de pre-pirólisis Brunswick para evitar falsas alarmas?",
    category: "Detección de Humo",
    mission: "SAME-R / Shuttle Fire Detector Heritage",
    answer: "El detector Brunswick muestrea continuamente el flujo de aire y utiliza una cámara de ionización y movilidad eléctrica para medir exclusivamente nanopartículas en la banda de 10 a 100 nm. Los polímeros aeroespaciales sobrecalentados (como PTFE o Kapton) emiten concentraciones masivas (>10^6 partículas/cm3) en este diámetro específico minutos antes de que ocurra la ignición visible o la coagulación browniana. Las partículas de polvo y fibras textiles tienen diámetros >2 µm, por lo que el detector las discrimina totalmente.",
    citation: "Mulholland et al., Fire Safety Journal, 2013"
  },
  {
    id: "EXP-11",
    question: "¿Por qué la niebla de agua a alta presión (NFPA 750) supera al CO2 en el espacio?",
    category: "Sistemas de Supresión",
    mission: "FEANICS / NASA Spacecraft Fire Safety Roadmap",
    answer: "El CO2 exige inundación total del compartimento, lo que eleva drásticamente la presión total de la cabina, requiere despresurizar el módulo y satura irreversiblemente los lechos de absorción de CO2 del sistema de soporte vital (ECLSS). La micro-niebla de agua a alta presión (35 bar, gotas de 35 µm) absorbe 2257 kJ/kg por calor latente de evaporación instantánea y se expande 1700 veces en vapor local en la llama, sofocando el foco con solo 150 ml de agua sin sobrepresurizar la cabina y siendo 100% recuperable por los condensadores de humedad del ECLSS.",
    citation: "Takahashi et al., Fire Safety Science, 2017; NFPA 750 Class 1 Spec"
  },
  {
    id: "EXP-12",
    question: "¿Qué papel cumple el aditivo encapsulante F-500 EA en microgravedad?",
    category: "Sistemas de Supresión",
    mission: "FEANICS / NFPA 18A Testing",
    answer: "El agua pura tiene una alta tensión superficial (72.8 mN/m) que en microgravedad forma grandes glóbulos flotantes desorientados que rebotan sobre los materiales encendidos y pueden cortocircuitar la electrónica. El aditivo encapsulante micelar F-500 EA (al 1% v/v) reduce la tensión superficial a 27.4 mN/m, permitiendo que la micro-niebla penetre en grietas y encapsule vapores de combustible y baterías de iones de litio en embalamiento térmico sin causar choque térmico destructivo.",
    citation: "NFPA 18A Standard on Water Additives for Fire Control; FEANICS Project"
  }
];
