import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
  BorderStyle,
  convertInchesToTwip,
  UnderlineType,
  TabStopType,
  TabStopPosition,
} from "docx";
import { saveAs } from "./saveAs";

const SUPABASE_LOGOS = "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos";

// Half-points: 1pt = 2 half-points
// PDF body ~11pt → 22 hp; small text ~9pt → 18 hp; title ~22pt → 44 hp
const BODY_SIZE = 20;       // 10pt — compact like the PDF
const SMALL_SIZE = 16;      // 8pt — for footer/sub text
const HEADER_TITLE = 36;    // 18pt — Campus365 brand title in header
const HEADER_SUB = 18;      // 9pt
const SECTION_HEADER = 20;  // 10pt bold — NDA section numbers
const NDA_TITLE = 26;       // 13pt bold centered

const FONT_SANS = "Calibri";
const FONT_SERIF = "Times New Roman";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchImageAsUint8Array(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
}

function sp(before = 0, after = 0) {
  return { before, after };
}

function b(text: string, size = BODY_SIZE, font = FONT_SANS, color?: string): TextRun {
  return new TextRun({ text, bold: true, size, font, ...(color ? { color } : {}) });
}

function t(text: string, size = BODY_SIZE, font = FONT_SANS, color?: string): TextRun {
  return new TextRun({ text, size, font, ...(color ? { color } : {}) });
}

function para(
  children: TextRun[],
  opts: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    before?: number;
    after?: number;
    bullet?: { level: number };
    border?: object;
  } = {}
): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: sp(opts.before ?? 0, opts.after ?? 80),
    ...(opts.bullet ? { bullet: opts.bullet } : {}),
    ...(opts.border ? { border: opts.border } : {}),
  });
}

function gap(twips = 120): Paragraph {
  return new Paragraph({ text: "", spacing: sp(twips, 0) });
}

function fmt(d: string, fb: string): string {
  if (!d) return fb;
  if (d.startsWith("[")) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

// ─── Shared Header ────────────────────────────────────────────────────────────

async function buildHeader(): Promise<Header> {
  const logoData = await fetchImageAsUint8Array(`${SUPABASE_LOGOS}/campus365-logo.png`);

  const logoCell = new TableCell({
    children: [
      new Paragraph({
        children: logoData
          ? [new ImageRun({ data: logoData, transformation: { width: 110, height: 44 }, type: "png" })]
          : [b("Campus365", HEADER_TITLE, FONT_SANS, "6b2fa8")],
        alignment: AlignmentType.LEFT,
      }),
    ],
    borders: noBorder(),
    width: { size: 50, type: WidthType.PERCENTAGE },
  });

  const titleCell = new TableCell({
    children: [
      para([b("Campus365", HEADER_TITLE, FONT_SANS, "6b2fa8")], { align: AlignmentType.RIGHT, after: 0 }),
      para([t("A Skoder Technologies Concern", HEADER_SUB, FONT_SANS, "c0392b")], { align: AlignmentType.RIGHT, after: 0 }),
      para([
        b("BIN# 002855793-0401", SMALL_SIZE, FONT_SANS, "c0392b"),
        t("  ·  ", SMALL_SIZE, FONT_SANS, "999999"),
        b("Trade# DNCC-056205/2022", SMALL_SIZE, FONT_SANS, "1e8449"),
      ], { align: AlignmentType.RIGHT, after: 0 }),
    ],
    borders: noBorder(),
    width: { size: 50, type: WidthType.PERCENTAGE },
  });

  const headerTable = new Table({
    rows: [new TableRow({ children: [logoCell, titleCell] })],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
  });

  return new Header({
    children: [
      headerTable,
      new Paragraph({
        border: { bottom: { style: BorderStyle.DASHED, size: 6, color: "BBBBBB" } },
        spacing: sp(80, 0),
      }),
    ],
  });
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

async function buildFooter(): Promise<Footer> {
  const keys = ["whatsapp.png", "skoder.png", "ibm.png", "ms-startups.png", "google-startups.png", "idea.png", "accelerating-bangladesh.png"];
  const [whatsappData, skoderData, ibmData, msData, googleData, ideaData, accelData] = await Promise.all(
    keys.map((k) => fetchImageAsUint8Array(`${SUPABASE_LOGOS}/${k}`))
  );

  function img(data: Uint8Array | null, w: number, h: number): TextRun | ImageRun {
    return data ? new ImageRun({ data, transformation: { width: w, height: h }, type: "png" }) : t("", SMALL_SIZE);
  }

  const contactPara = new Paragraph({
    children: [
      ...(whatsappData ? [new ImageRun({ data: whatsappData, transformation: { width: 12, height: 12 }, type: "png" })] : []),
      t("  +88 01750 726094", SMALL_SIZE, FONT_SANS, "1e8449"),
      t("     |     ", SMALL_SIZE, FONT_SANS, "AAAAAA"),
      t("www.campus365.net", SMALL_SIZE, FONT_SANS, "2874a6"),
      t("     |     ", SMALL_SIZE, FONT_SANS, "AAAAAA"),
      t("IDEA Project, ICT Tower, Agargaon, Dhaka-1207", SMALL_SIZE, FONT_SANS, "1e8449"),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.DASHED, size: 6, color: "BBBBBB" } },
    spacing: sp(120, 80),
  });

  const partnerPara = new Paragraph({
    children: [
      img(skoderData, 44, 16), t("   ", SMALL_SIZE),
      img(ibmData, 28, 14),    t("   ", SMALL_SIZE),
      img(msData, 72, 16),     t("   ", SMALL_SIZE),
      img(googleData, 72, 14), t("   ", SMALL_SIZE),
      img(ideaData, 36, 16),   t("   ", SMALL_SIZE),
      img(accelData, 56, 16),
    ],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 0),
  });

  return new Footer({ children: [contactPara, partnerPara] });
}

// ─── Appointment Letter ───────────────────────────────────────────────────────

export async function generateAppointmentLetterDocx(fields: {
  date: string;
  recipientName: string;
  recipientInstitution: string;
  subject: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  workHours: string;
  workDays: string;
  compensation: string;
  responsibilities: string;
  signatoryName: string;
  signatoryDesignation: string;
}): Promise<void> {
  const [header, footer] = await Promise.all([buildHeader(), buildFooter()]);

  function bS(text: string) { return new TextRun({ text, bold: true, size: 24 }); } // 12pt
  function tS(text: string) { return new TextRun({ text, size: 24 }); } // 12pt

  function pS(children: TextRun[], align = AlignmentType.LEFT): Paragraph {
    return new Paragraph({ 
      children, 
      alignment: align, 
      style: "Normal(Web)" 
    });
  }

  const body: Paragraph[] = [
    // Sender address block
    pS([bS("Campus365")]),
    pS([tS("ICT Tower: E-14/X, Agargaon, Dhaka 1207")]),
    
    // Date
    pS([bS("Date: "), tS(fmt(fields.date, "[Date]"))]),
    
    // Recipient
    pS([bS("To:")]),
    pS([tS(fields.recipientName)]),
    pS([tS(fields.recipientInstitution)]),
    
    // Subject
    pS([bS(`Subject: ${fields.subject}`)]),
    
    // Salutation
    pS([tS(`Dear ${fields.recipientName},`)]),
    
    // Body paragraph 1
    pS([
      tS("We are pleased to inform you that you have been appointed as a "),
      bS(fields.position),
      tS(" at "),
      bS("Campus365"),
      tS(", effective "),
      bS(fmt(fields.startDate, "[Start Date]")),
      tS(" to "),
      bS(fmt(fields.endDate, "[End Date]")),
      tS("."),
    ], AlignmentType.JUSTIFIED),
    
    // Body paragraph 2
    pS([
      tS("Your working hours will be "),
      bS(fields.workHours),
      tS(", from "),
      bS(fields.workDays),
      tS(", and this is a "),
      bS(fields.compensation),
      tS(". During your internship, you are expected to "),
      tS(fields.responsibilities),
      tS("."),
    ], AlignmentType.JUSTIFIED),
    
    // Body paragraph 3
    pS([
      tS("All materials, data, and information accessed during the internship remain the property of "),
      bS("Campus365"),
      tS(", and must not be disclosed to any third party."),
    ], AlignmentType.JUSTIFIED),
    
    // Body paragraph 4
    pS([
      tS("Upon successful completion of the internship, you will be awarded an "),
      bS("Internship Completion Certificate"),
      tS("."),
    ], AlignmentType.JUSTIFIED),
    
    // Body paragraph 5
    pS([
      tS("We welcome you to "),
      bS("Campus365"),
      tS(" and look forward to your valuable contributions."),
    ], AlignmentType.JUSTIFIED),
    
    // Closing
    pS([tS("Warm regards,")]),
    
    // Signatory block
    pS([bS("For Campus365")]),
    pS([tS("Authorized Signatory:")]),
    
    new Paragraph({
      children: [
        tS("Name: "),
        tS(fields.signatoryName),
      ],
      style: "Normal(Web)",
      spacing: { before: 240, after: 0 }
    }),
    new Paragraph({
      children: [
        tS("Designation: "),
        tS(fields.signatoryDesignation),
      ],
      style: "Normal(Web)",
      spacing: { before: 0, after: 240 }
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
          }
        }
      },
      paragraphStyles: [
        {
          id: "Normal(Web)",
          name: "Normal (Web)",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 24,
          },
          paragraph: {
            spacing: { before: 240, after: 240, line: 312 }, // 12pt before/after, 1.3 line spacing
            alignment: AlignmentType.LEFT
          }
        },
      ]
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      headers: { default: header },
      footers: { default: footer },
      children: body,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `appointment-letter-${fields.recipientName || "draft"}.docx`);
}

// ─── NDA ─────────────────────────────────────────────────────────────────────

export async function generateNDADocx(fields: {
  date: string;
  internName: string;
  internAddress: string;
  companySignatoryTitle: string;
}): Promise<void> {
  const [header, footer] = await Promise.all([buildHeader(), buildFooter()]);

  const F = FONT_SERIF; // NDA uses serif to match the on-screen format
  const fmtDate = fmt(fields.date, "[Date]");

  // Build day/month/year parts like the on-screen format
  let dateDay = "_________", dateMonth = "_________", dateYear = "2025";
  if (fields.date) {
    const d = new Date(fields.date);
    if (!isNaN(d.getTime())) {
      dateDay = d.getDate().toString();
      dateMonth = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
      dateYear = d.getFullYear().toString();
    }
  }

  function bS(text: string) { return new TextRun({ text, bold: true, size: 24 }); } // 12pt
  function tS(text: string) { return new TextRun({ text, size: 24 }); } // 12pt

  // Form field with persistent underline
  function uField(val: string, placeholder: string, minLength = 30) {
    const isFilled = val && val !== placeholder && val !== "";
    let text = isFilled ? val : "";
    if (text.length < minLength) {
      text += "\u00A0".repeat(minLength - text.length);
    }
    return new TextRun({ text, size: 24, underline: { type: UnderlineType.SINGLE } });
  }

  // Body paragraphs use "Normal(Web)" style - 12pt Times New Roman, Left aligned, 12pt before/after
  function pS(children: TextRun[], align = AlignmentType.LEFT): Paragraph {
    return new Paragraph({ 
      children, 
      alignment: align, 
      style: "Normal(Web)" 
    });
  }

  // Section headers use Heading 3 style overridden (12pt before, 6pt after)
  function sectionHead(text: string): Paragraph {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, size: 24 })],
      style: "Heading3",
      alignment: AlignmentType.LEFT
    });
  }

  // Bullets use Wingdings, specific indentations, and 3pt before/after spacing
  function bullet(children: TextRun[]): Paragraph {
    return new Paragraph({ 
      children, 
      bullet: { level: 0 }, 
      style: "ListParagraph",
      indent: { left: 840, hanging: 420 },
      tabStops: [{ type: TabStopType.LEFT, position: 840 }]
    });
  }

  const body: Paragraph[] = [
    // Title — Heading 2 style overridden
    new Paragraph({
      children: [new TextRun({
        text: "Non-Disclosure Agreement (NDA)",
        bold: true,
        size: 36, // 18pt
      })],
      alignment: AlignmentType.CENTER,
      style: "Heading2"
    }),

    // Intro
    pS([bS("This Nondisclosure Agreement"), tS(` is entered into on this ${dateDay} day of ${dateMonth}, ${dateYear}, by and between:`)]),
    pS([bS("The Company:"), tS(" Campus365, located at E-14/X, ICT Tower (14th Floor), Agargaon, Dhaka - 1207, Bangladesh.")]),
    pS([bS("The Intern:"), tS(` ${fields.internName}, residing at ${fields.internAddress}.`)]),

    // Section 1
    sectionHead("1. Definition of Confidential Information"),
    pS([tS('"Confidential Information" refers to any data or information that is proprietary to the Company and not generally known to the public, whether in tangible or intangible form. This includes, but is not limited to:')]),
    bullet([tS("Technical data, software code, and product designs.")]),
    bullet([tS("Business plans, marketing strategies, and financial information.")]),
    bullet([tS("Customer lists, vendor details, and employee records.")]),
    bullet([tS('Any information marked "Confidential" or which the Intern should reasonably understand to be confidential.')]),

    // Section 2
    sectionHead("2. Obligations of the Intern"),
    pS([tS("The Intern agrees to:")]),
    bullet([tS("Hold all Confidential Information in strict confidence.")]),
    bullet([tS("Use the information "), bS("solely"), tS(" for the purpose of performing their internship duties.")]),
    bullet([tS("Not disclose, publish, or communicate any Confidential Information to any third party without prior written consent from the Company.")]),
    bullet([tS("Take all reasonable precautions to prevent unauthorized disclosure (e.g., locking devices, not using public Wi-Fi for sensitive work).")]),

    // Section 3
    sectionHead("3. Exclusions"),
    pS([tS("Confidential Information does not include information that:")]),
    bullet([tS("Is or becomes public knowledge through no fault of the Intern.")]),
    bullet([tS("Was rightfully in the Intern's possession before the internship began.")]),
    bullet([tS("Is independently developed by the Intern without the use of Company information.")]),

    // Section 4
    sectionHead("4. Ownership of Work Product"),
    pS([
      tS("The Intern agrees that any inventions, improvements, designs, or \"work product\" created during the internship period related to the Company's business are the "),
      bS("sole property of the Company"),
      tS(". The Intern hereby assigns all rights, including intellectual property rights, to the Company."),
    ]),

    // Section 5
    sectionHead("5. Term and Termination"),
    pS([
      tS("This Agreement remains in effect during the internship and shall survive for a period of "),
      bS("1 year"),
      tS(" after the internship ends. Upon termination of the internship, the Intern must immediately return or destroy all documents, devices, and files containing Confidential Information."),
    ]),

    // Section 6
    sectionHead("6. Remedies"),
    pS([tS("The Intern acknowledges that any breach of this Agreement may cause irreparable harm to the Company for which monetary damages may be inadequate. Therefore, the Company shall be entitled to seek injunctive relief in addition to any other legal remedies.")]),

    // Signatures
    sectionHead("Signatures"),
    // Company signature row
    pS([bS("For the Company:"), tS("  By: "), uField("", "", 35)]),
    new Paragraph({
      children: [
        tS("Title: "),
        uField(fields.companySignatoryTitle, "[Designation]", 25),
        tS("      Date: "),
        tS(fmtDate),
      ],
      style: "Normal(Web)"
    }),
    // Intern signature row
    pS([bS("The Intern:"), tS("  By: "), uField("", "", 35)]),
    new Paragraph({
      children: [
        tS("Name: "),
        uField(fields.internName, "[Intern Name]", 25),
        tS("      Date: "),
        tS(fmtDate),
      ],
      style: "Normal(Web)"
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
          }
        }
      },
      paragraphStyles: [
        {
          id: "Normal(Web)",
          name: "Normal (Web)",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 24,
          },
          paragraph: {
            spacing: { before: 240, after: 240, line: 320 }, // 12pt before/after, 1.3 line spacing
            alignment: AlignmentType.LEFT
          }
        },
        {
          id: "ListParagraph",
          name: "List Paragraph",
          basedOn: "Normal(Web)",
          next: "ListParagraph",
          paragraph: {
            spacing: { before: 60, after: 60 }, // 3pt before/after
            alignment: AlignmentType.LEFT
          }
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 36, // 18pt
            bold: true,
          },
          paragraph: {
            spacing: { beforeAutoSpacing: true, afterAutoSpacing: true },
            alignment: AlignmentType.CENTER
          }
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
            bold: true,
          },
          paragraph: {
            spacing: { before: 240, after: 120 }, // 12pt before / 6pt after
            alignment: AlignmentType.LEFT
          }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: "bullet-points",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 840, hanging: 420 },
                },
                run: {
                  font: "Wingdings",
                }
              }
            }
          ]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      headers: { default: header },
      footers: { default: footer },
      children: body,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `NDA-${fields.internName || "draft"}.docx`);
}
