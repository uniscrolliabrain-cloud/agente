// LEGAL_CONTENT_V1 - textos publicados en agntiapro.com el 2026-11-21,
// recuperados literalmente de las seis páginas vigentes. No editar a mano sin
// reconciliación jurídica: este archivo es la fuente que renderiza /legal.
export type LegalSection = { id: string; title: string; paragraphs: string[]; items?: string[] };
export type LegalDoc = { id: string; label: string; kind: string; summary: string; version: string; sections: LegalSection[] };

export const LEGAL_DOCS: LegalDoc[] = [
  {
    "id": "aviso-legal",
    "label": "Aviso legal",
    "kind": "Quién está detrás",
    "summary": "Titular, contacto y reglas de uso de este sitio.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "identificacion",
        "title": "Identificación",
        "paragraphs": [
          "AgntiaPro es un servicio ofrecido por Alfonso Luna de Prado, NIF 45736999G, con domicilio en calle Valle-Inclán s/n, 38007 Santa Cruz de Tenerife, España. Correo de contacto: <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>. El prestador actúa como persona física."
        ]
      },
      {
        "id": "actividad",
        "title": "Actividad",
        "paragraphs": [
          "AgntiaPro presenta un proyecto de software y agentes de inteligencia artificial para empresas. La web es informativa. Puedes escribirnos para consultar el estado del proyecto."
        ]
      },
      {
        "id": "uso-y-propiedad-intelectual",
        "title": "Uso y propiedad intelectual",
        "paragraphs": [
          "Los contenidos propios del sitio y sus elementos identificativos están protegidos por la normativa aplicable. Las marcas, modelos, bibliotecas y servicios de terceros pertenecen a sus respectivos titulares. No se autoriza el uso ilícito ni la interferencia con el funcionamiento del sitio."
        ]
      },
      {
        "id": "responsabilidad",
        "title": "Responsabilidad",
        "paragraphs": [
          "La información pública es descriptiva. Los resultados de inteligencia artificial pueden contener errores y requieren revisión adecuada antes de tomar decisiones relevantes. Esta cláusula no limita los derechos irrenunciables reconocidos por la ley."
        ]
      },
      {
        "id": "contacto-y-normativa",
        "title": "Contacto y normativa",
        "paragraphs": [
          "Para consultas o reclamaciones, escribe a laia@agntiapro.com. Se aplica la normativa española y europea que corresponda, sin perjuicio de las reglas imperativas de competencia judicial y protección de consumidores cuando resulten aplicables."
        ]
      }
    ]
  },
  {
    "id": "privacidad",
    "label": "Política de privacidad",
    "kind": "Tus datos",
    "summary": "Qué se recoge, para qué y cuánto tiempo se guarda.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "responsable-y-contacto",
        "title": "Responsable y contacto",
        "paragraphs": [
          "El responsable de los tratamientos propios del servicio es Alfonso Luna de Prado, NIF 45736999G, con domicilio en calle Valle-Inclán s/n, 38007 Santa Cruz de Tenerife, España. Contacto para privacidad: <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      },
      {
        "id": "datos-tratados",
        "title": "Datos tratados",
        "paragraphs": [
          "Al visitar esta web, la infraestructura de alojamiento recibe los datos técnicos necesarios para entregar la página, como la dirección IP y la información de la solicitud. Si escribes por correo, recibimos tu dirección y los datos que incluyas en el mensaje."
        ]
      },
      {
        "id": "finalidades-y-legitimacion",
        "title": "Finalidades y legitimación",
        "paragraphs": [
          "Los datos técnicos se usan para entregar y proteger el sitio, por el interés legítimo en mantenerlo disponible y seguro. El correo se utiliza para responder a tu consulta, por el interés legítimo en atenderla o para tomar medidas precontractuales cuando tú las solicites."
        ]
      },
      {
        "id": "destinatarios-y-transferencias",
        "title": "Destinatarios y transferencias",
        "paragraphs": [
          "El sitio informativo utiliza Vercel y la portada de demostración en www.agntiapro.com se aloja en Fly.io. Las portadas solicitan tipografías a Google Fonts. Al escribirnos, también intervienen los servicios de correo utilizados para entregar y recibir el mensaje. Puedes pedir detalles sobre destinatarios y, cuando proceda, sobre transferencias y sus garantías en <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      },
      {
        "id": "conservacion",
        "title": "Conservación",
        "paragraphs": [
          "El criterio de conservación de las consultas es el tiempo necesario para gestionarlas y atender las obligaciones legales o responsabilidades que puedan derivarse. Para información sobre los registros técnicos de una visita, escribe al contacto de privacidad."
        ]
      },
      {
        "id": "derechos",
        "title": "Derechos",
        "paragraphs": [
          "Puedes ejercer los derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad cuando procedan, escribiendo a <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>. Podemos pedir información adicional cuando sea necesario verificar tu identidad. También puedes reclamar ante la <a href=\"https://www.aepd.es/\">Agencia Española de Protección de Datos</a>."
        ]
      },
      {
        "id": "datos-de-terceros-y-decisiones-automatizadas",
        "title": "Datos de terceros y decisiones automatizadas",
        "paragraphs": [
          "La portada de demostración contiene interacciones simuladas que se ejecutan en tu navegador. Escribe solo datos ficticios en la demostración. Facilitar datos en una consulta por correo es voluntario."
        ]
      }
    ]
  },
  {
    "id": "terminos",
    "label": "Términos del servicio",
    "kind": "El contrato",
    "summary": "Qué incluye el servicio y qué se espera de cada parte.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "titular-y-destinatarios",
        "title": "Titular y destinatarios",
        "paragraphs": [
          "AgntiaPro es prestado por Alfonso Luna de Prado, NIF 45736999G, con domicilio en calle Valle-Inclán s/n, 38007 Santa Cruz de Tenerife, España. Contacto: laia@agntiapro.com. El servicio se dirige principalmente a empresas y profesionales. Las condiciones particulares acordadas con cada cliente prevalecerán cuando corresponda."
        ]
      },
      {
        "id": "objeto-y-contratacion",
        "title": "Objeto y contratación",
        "paragraphs": [
          "Estas condiciones se aplican a la consulta del sitio informativo. Las páginas públicas no tramitan compras ni altas. La demostración no reserva citas ni conecta herramientas. Una consulta por correo no constituye un contrato."
        ]
      },
      {
        "id": "usuarios-y-permisos",
        "title": "Usuarios y permisos",
        "paragraphs": [
          "Utiliza este sitio conforme a la ley y respeta los derechos de terceros."
        ]
      },
      {
        "id": "ia-y-responsabilidad-de-uso",
        "title": "IA y responsabilidad de uso",
        "paragraphs": [
          "Las descripciones del producto son informativas. Los resultados de IA pueden contener errores."
        ]
      },
      {
        "id": "datos-y-terceros",
        "title": "Datos y terceros",
        "paragraphs": [
          "Consulta la <a href=\"/legal#privacidad\">política de privacidad</a> para conocer el tratamiento de datos al visitar la web o escribirnos."
        ]
      },
      {
        "id": "ley-y-reclamaciones",
        "title": "Ley y reclamaciones",
        "paragraphs": [
          "Las controversias se resolverán conforme al contrato y a la normativa imperativa aplicable. Para consultas o reclamaciones: laia@agntiapro.com. Ninguna disposición de estos términos limita derechos irrenunciables."
        ]
      }
    ]
  },
  {
    "id": "cookies",
    "label": "Política de cookies",
    "kind": "Tu navegador",
    "summary": "Qué se guarda en el navegador y cómo cambiarlo.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "tecnologias-utilizadas",
        "title": "Tecnologías utilizadas",
        "paragraphs": [
          "Esta política describe las páginas públicas de AgntiaPro. Su código no instala cookies de analítica o publicidad. Las portadas públicas solicitan tipografías a Google Fonts."
        ]
      },
      {
        "id": "almacenamiento-local",
        "title": "Almacenamiento local",
        "paragraphs": [
          "Las páginas informativas no escriben en el almacenamiento local ni en el almacenamiento de sesión del navegador."
        ]
      },
      {
        "id": "terceros-y-opciones",
        "title": "Terceros y opciones",
        "paragraphs": [
          "Los enlaces a sitios externos o al correo abren otros servicios cuando los eliges. Sus condiciones y tecnologías dependen del destino."
        ]
      },
      {
        "id": "gestion-y-contacto",
        "title": "Gestión y contacto",
        "paragraphs": [
          "Puedes gestionar los datos de sitio desde la configuración del navegador. Para consultas sobre esta web, escribe a <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      }
    ]
  },
  {
    "id": "transparencia-ia",
    "label": "Transparencia sobre inteligencia artificial",
    "kind": "Cómo decide LAIA",
    "summary": "Qué prepara la IA, qué decides tú y dónde se pide permiso.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "identificacion",
        "title": "Identificación",
        "paragraphs": [
          "LAIA es un sistema de inteligencia artificial de AgntiaPro. La landing presenta información sobre el proyecto."
        ]
      },
      {
        "id": "funcionamiento",
        "title": "Funcionamiento",
        "paragraphs": [
          "Las respuestas de la demostración son simuladas. La demostración no ejecuta acciones de agentes ni accede a herramientas o datos de terceros."
        ]
      },
      {
        "id": "resultados-y-contenido-sintetico",
        "title": "Resultados y contenido sintético",
        "paragraphs": [
          "Las salidas de inteligencia artificial pueden contener errores. Comprueba la información importante antes de utilizarla."
        ]
      },
      {
        "id": "datos-y-control",
        "title": "Datos y control",
        "paragraphs": [
          "La landing no solicita acceso al micrófono ni a la cámara. Para consultas, escribe a <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      }
    ]
  },
  {
    "id": "confianza-seguridad",
    "label": "Confianza y seguridad",
    "kind": "Garantías",
    "summary": "Compromisos verificables sobre datos, IA y disponibilidad.",
    "version": "21 de noviembre de 2026",
    "sections": [
      {
        "id": "informacion-y-documentacion",
        "title": "Información y documentación",
        "paragraphs": [
          "Este centro reúne los documentos legales de AgntiaPro: <a href=\"/legal#aviso-legal\">Aviso legal</a>, <a href=\"/legal#privacidad\">Privacidad</a>, <a href=\"/legal#cookies\">Cookies</a>, <a href=\"/legal#terminos\">Términos</a> y <a href=\"/legal#transparencia-ia\">Transparencia IA</a>."
        ]
      },
      {
        "id": "privacidad-y-seguridad",
        "title": "Privacidad y seguridad",
        "paragraphs": [
          "Esta web pública es informativa y se sirve mediante HTTPS. Su <a href=\"/legal#privacidad\">política de privacidad</a> describe los datos tratados al visitarla o escribirnos."
        ]
      },
      {
        "id": "derechos-y-solicitudes",
        "title": "Derechos y solicitudes",
        "paragraphs": [
          "Para ejercer derechos de privacidad o comunicar un incidente relacionado con el sitio, escribe a <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      },
      {
        "id": "proveedores-y-servicios-conectados",
        "title": "Proveedores y servicios conectados",
        "paragraphs": [
          "La demostración pública simula interacciones. No activa conexiones de clientes ni funciones operativas."
        ]
      },
      {
        "id": "ia-y-contacto",
        "title": "IA y contacto",
        "paragraphs": [
          "LAIA es una interfaz de inteligencia artificial. Para consultas de seguridad, privacidad, información legal o incidentes escribe a <a href=\"mailto:laia@agntiapro.com\">laia@agntiapro.com</a>."
        ]
      }
    ]
  }
];
