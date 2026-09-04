import { StyleSheet, Font } from "@react-pdf/renderer";

// ── Font registration (matching the web app's primary font) ──────────────────

Font.register({
  family: "Montserrat",
  fonts: [
    { src: "https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2", fontWeight: 700 },
  ],
});

// ── PDF styles ──────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Montserrat",
    fontSize: 10,
    color: "#1b4332",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#1b4332",
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1b4332",
  },
  companySub: {
    fontSize: 9,
    color: "#555",
    marginTop: 2,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
    color: "#1b4332",
  },
  receiptTitleZh: {
    fontSize: 12,
    fontWeight: 700,
    textAlign: "right",
    color: "#1b4332",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    color: "#666",
    fontSize: 9,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 700,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1b4332",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1b4332",
    paddingVertical: 6,
    fontSize: 9,
    fontWeight: 700,
    color: "#1b4332",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    fontSize: 9,
  },
  colDescription: { flex: 3 },
  colRef: { flex: 1.5, textAlign: "center" },
  colHours: { flex: 1, textAlign: "center" },
  colAmount: { flex: 1.5, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  stampSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  stampBox: {
    borderWidth: 1,
    borderColor: "#1b4332",
    padding: 10,
    borderRadius: 4,
    width: 200,
    alignItems: "center",
  },
  stampText: {
    fontSize: 8,
    color: "#1b4332",
    textAlign: "center",
  },
  stampTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1b4332",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});