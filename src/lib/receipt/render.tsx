import "server-only";

import React from "react";
import { renderToBuffer, Document, Page, View, Text } from "@react-pdf/renderer";

import { TEXTS } from "./texts";
import { styles } from "./styles";

// ── Props for the render function ──────────────────────────────────────────

export interface RenderReceiptData {
  receiptNumber: string;
  nameZh: string;
  nameEn: string;
  courseZh: string;
  courseEn: string;
  iaRef: string | null;
  cpdHours: number;
  fee: string;
  paymentMethod: string;
  paymentDate: string;
}

// ── ReceiptDocument component ──────────────────────────────────────────────

const ReceiptDocument: React.FC<RenderReceiptData> = (props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 1: Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>{TEXTS.companyNameEn}</Text>
          <Text style={styles.companySub}>{TEXTS.companyNameZh}</Text>
        </View>
        <View>
          <Text style={styles.receiptTitle}>{TEXTS.receiptTitleEn}</Text>
          <Text style={styles.receiptTitleZh}>{TEXTS.receiptTitleZh}</Text>
        </View>
      </View>

      {/* 2: Metadata */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.receiptNoLabel}</Text>
        <Text style={styles.metaValue}>{props.receiptNumber}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.dateLabel}</Text>
        <Text style={styles.metaValue}>{props.paymentDate}</Text>
      </View>

      {/* 3: Registrant */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.registrantSection}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.nameEnLabel}</Text>
        <Text style={styles.metaValue}>{props.nameEn}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.nameZhLabel}</Text>
        <Text style={styles.metaValue}>{props.nameZh}</Text>
      </View>

      {/* 4: Course table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.courseSection}</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.colDescription}>{TEXTS.tableDescription}</Text>
        <Text style={styles.colRef}>{TEXTS.tableIaRef}</Text>
        <Text style={styles.colHours}>{TEXTS.tableCpd}</Text>
        <Text style={styles.colAmount}>{TEXTS.tableAmount}</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.colDescription}>{props.courseEn}{"\n"}{props.courseZh}</Text>
        <Text style={styles.colRef}>{props.iaRef ?? TEXTS.dash}</Text>
        <Text style={styles.colHours}>{props.cpdHours}</Text>
        <Text style={styles.colAmount}>HKD {props.fee}</Text>
      </View>

      {/* 5: Total */}
      <View style={styles.totalRow}>
        <Text>{TEXTS.totalPrefix}{props.fee}</Text>
      </View>

      {/* 6: Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.paymentSection}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.methodLabel}</Text>
        <Text style={styles.metaValue}>{props.paymentMethod}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.statusLabel}</Text>
        <Text style={styles.metaValue}>{TEXTS.statusVerified}</Text>
      </View>

      {/* 7: Stamp */}
      <View style={styles.stampSection}>
        <View style={styles.stampBox}>
          <Text style={styles.stampTitle}>{TEXTS.stampTitle}</Text>
          <Text style={styles.stampText}>{TEXTS.stampSubtitle}</Text>
          <Text style={[styles.stampText, { marginTop: 4 }]}>{TEXTS.stampAuthorised}</Text>
        </View>
      </View>

      {/* 8: Footer */}
      <Text style={styles.footer}>
        {TEXTS.footerDisclaimer}{"\n"}
        {TEXTS.footerAddress}
      </Text>
    </Page>
  </Document>
);

// ── Public render function ─────────────────────────────────────────────────

/**
 * Renders a receipt PDF to a Buffer.
 * Used by generateReceipt and the download endpoint.
 */
export async function renderReceiptPdf(data: RenderReceiptData): Promise<Buffer> {
  return await renderToBuffer(<ReceiptDocument {...data} />);
}