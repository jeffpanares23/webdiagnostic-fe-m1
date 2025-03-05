<template>
  <div class="flex justify-center space-x-4 py-4">
    <button
      class="px-4 py-2 bg-blue-500 text-white rounded-lg"
      @click="exportAsPDF"
    >
      Export as PDF
    </button>
    <button
      class="px-4 py-2 bg-green-500 text-white rounded-lg"
      @click="exportAsCSV"
    >
      Export as CSV
    </button>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  props: ["results"], // ✅ Ensure results are passed as a prop
  methods: {
    // ✅ Export as PDF (Nicely Formatted)
    exportAsPDF() {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Website Diagnostic Report", 10, 10);
      doc.setFontSize(12);

      // ✅ Metadata Validation
      if (this.results.metadata) {
        doc.text("Metadata Validation", 10, 20);
        doc.autoTable({
          startY: 25,
          head: [["Field", "Value"]],
          body: [
            ["Meta Title", this.results.metadata.title || "N/A"],
            [
              "Title Length",
              `${this.results.metadata.title_length} characters` || "N/A",
            ],
            ["Meta Description", this.results.metadata.description || "N/A"],
            [
              "Description Length",
              `${this.results.metadata.description_length} characters` || "N/A",
            ],
          ],
        });
      }

      // ✅ SOP Compliance
      if (this.results.sop) {
        doc.text("SOP Compliance", 10, doc.autoTable.previous.finalY + 10);
        doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          head: [["Field", "Value"]],
          body: [
            ["Company Name", this.results.sop.company_name || "N/A"],
            ["Address", this.results.sop.address || "N/A"],
            ["Phone", this.results.sop.phone_number || "N/A"],
            ["Email", this.results.sop.email_address || "N/A"],
            ["Copyright", this.results.sop.copyright || "N/A"],
          ],
        });
      }

      // ✅ SEO Checks
      if (this.results.seo_checks) {
        doc.text("SEO Checks", 10, doc.autoTable.previous.finalY + 10);
        doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          head: [["Field", "Value"]],
          body: [
            ["Has HTTPS", this.results.seo_checks.hasHttps ? "Yes" : "No"],
          ],
        });
      }

      // ✅ Issues to Fix
      if (this.results.issues && this.results.issues.length > 0) {
        doc.text("Issues to Fix", 10, doc.autoTable.previous.finalY + 10);
        doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          head: [["Priority", "Issue"]],
          body: this.results.issues.map((issue) => [
            issue.priority,
            issue.message,
          ]),
        });
      }

      doc.save("Website_Diagnostic_Report.pdf");
    },

    // ✅ Export as CSV (Nicely Structured)
    exportAsCSV() {
      const csvRows = [];

      // ✅ Add Header
      csvRows.push('"Website Diagnostic Report"');
      csvRows.push(""); // Empty row for spacing

      // ✅ Metadata Section
      if (this.results.metadata) {
        csvRows.push('"METADATA VALIDATION"');
        csvRows.push("Field,Value");
        csvRows.push(`Meta Title,"${this.results.metadata.title || "N/A"}"`);
        csvRows.push(
          `Title Length,"${
            this.results.metadata.title_length || "N/A"
          } characters"`
        );
        csvRows.push(
          `Meta Description,"${this.results.metadata.description || "N/A"}"`
        );
        csvRows.push(
          `Description Length,"${
            this.results.metadata.description_length || "N/A"
          } characters"`
        );
        csvRows.push(""); // Empty row for spacing
      }

      // ✅ SOP Compliance Section
      if (this.results.sop) {
        csvRows.push('"SOP COMPLIANCE"');
        csvRows.push("Field,Value");
        csvRows.push(
          `Company Name,"${this.results.sop.company_name || "N/A"}"`
        );
        csvRows.push(`Address,"${this.results.sop.address || "N/A"}"`);
        csvRows.push(`Phone,"${this.results.sop.phone_number || "N/A"}"`);
        csvRows.push(`Email,"${this.results.sop.email_address || "N/A"}"`);
        csvRows.push(`Copyright,"${this.results.sop.copyright || "N/A"}"`);
        csvRows.push(""); // Empty row for spacing
      }

      // ✅ SEO Checks Section
      if (this.results.seo_checks) {
        csvRows.push('"SEO CHECKS"');
        csvRows.push("Field,Value");
        csvRows.push(
          `Has HTTPS,${this.results.seo_checks.hasHttps ? "Yes" : "No"}`
        );
        csvRows.push(""); // Empty row for spacing
      }

      // ✅ Issues to Fix Section
      if (this.results.issues && this.results.issues.length > 0) {
        csvRows.push('"ISSUES TO FIX"');
        csvRows.push("Priority,Issue");

        this.results.issues.forEach((issue) => {
          const priorityText =
            issue.priority === "HIGH"
              ? "[HIGH]"
              : issue.priority === "MEDIUM"
              ? "[MEDIUM]"
              : "[LOW]";
          csvRows.push(`"${priorityText}","${issue.message}"`);
        });
      }

      // ✅ Create and Download CSV File
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Website_Diagnostic_Report.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
button {
  cursor: pointer;
}
</style>
