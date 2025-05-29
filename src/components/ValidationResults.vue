<template>
  <div class="grid grid-cols-12 gap-4">
    <!-- Left: Main Results Table -->
    <div class="col-span-12 bg-white p-8">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-lg font-semibold">Scanned Pages</h2>
        <button
          @click="exportToCSV"
          class="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <!-- Per-column Filters -->
      <div class="grid grid-cols-6 gap-2 mb-2 text-xs">
        <select
          v-model="filters.titleStatus"
          class="border p-1 rounded filters"
        >
          <option value="">All Titles</option>
          <option value="ideal">Ideal</option>
          <option value="short">Too Short</option>
          <option value="long">Too Long</option>
        </select>
        <select v-model="filters.metaStatus" class="border p-1 rounded filters">
          <option value="">All Meta</option>
          <option value="valid">Valid</option>
          <option value="missing">Missing</option>
          <option value="duplicate">Duplicate</option>
        </select>
        <select v-model="filters.https" class="border p-1 rounded filters">
          <option value="">All HTTPS</option>
          <option value="Yes">HTTPS</option>
          <option value="No">HTTP</option>
        </select>
        <select
          v-model="filters.duplicateTitle"
          class="border p-1 rounded filters"
        >
          <option value="">Duplicate Title?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search URL..."
          class="border p-1 px-2 rounded col-span-2 text-[1rem]"
        />
      </div>

      <!-- Results Table -->
      <div class="overflow-y-auto max-h-[420px] border rounded text-xs">
        <table class="w-full">
          <thead class="sticky top-0 z-10">
            <tr>
              <th class="px-2 py-1 border border-gray-200">#</th>
              <th class="px-2 py-1 border border-gray-200">URL</th>
              <th class="px-2 py-1 border border-gray-200">Title</th>
              <th class="px-2 py-1 border border-gray-200">Meta Desc</th>
              <th class="px-2 py-1 border border-gray-200">HTTPS</th>
              <!-- <th class="px-2 py-1">Status</th> -->
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="n in 5" :key="n" class="border-b">
                <td class="px-2 py-1 text-center">
                  <div class="animate-pulse bg-gray-300 h-4 w-4 rounded"></div>
                </td>
                <td class="px-2 py-1 text-center">
                  <div
                    class="animate-pulse bg-gray-300 h-4 w-full rounded"
                  ></div>
                </td>
                <td class="px-2 py-1 text-center">
                  <div
                    class="animate-pulse bg-gray-300 h-4 w-full rounded"
                  ></div>
                </td>
                <td class="px-2 py-1 text-center">
                  <div
                    class="animate-pulse bg-gray-300 h-4 w-full rounded"
                  ></div>
                </td>
                <td class="px-2 py-1 text-center">
                  <div class="animate-pulse bg-gray-300 h-4 w-8 rounded"></div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="(page, index) in filteredResults"
                :key="index"
                class="hover:bg-blue-50 border-b cursor-pointer"
                @click="selectPage(index)"
              >
                <td class="px-2 py-1 text-center border border-gray-200">
                  {{ index + 1 }}
                </td>
                <td
                  class="px-2 py-1 text-center text-blue-600 underline break-all border border-gray-200"
                >
                  {{ page.url }}
                </td>
                <td class="px-2 py-1 text-center border border-gray-200">
                  {{ page.title }}
                </td>
                <td class="px-2 py-1 text-center border border-gray-200">
                  {{ page.description || "—" }}
                </td>
                <td class="px-2 py-1 text-center border border-gray-200">
                  {{ page.hasHttps }}
                </td>
                <!-- <td class="px-2 py-1">
                <span
                  v-if="page.is_description_missing || !page.is_title_ideal"
                  class="text-red-600"
                  >❌ Issues</span
                >
                <span
                  v-else-if="
                    page.is_title_too_short || page.is_description_duplicate
                  "
                  class="text-yellow-500"
                  >⚠️ Warnings</span
                >
                <span v-else class="text-green-600">✅ Valid</span>
              </td> -->
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Bottom Panel: Tabbed Page Details -->
      <div
        v-if="selectedPage"
        ref="detailsSection"
        class="mt-4 border rounded p-3 bg-gray-50"
      >
        <div class="mb-2">
          <h3 class="font-semibold text-sm" v-if="currentPage?.url">
            Details for:
            <span class="text-blue-600">{{ currentPage?.url || "N/A" }}</span>
          </h3>
        </div>
        <div class="flex text-sm">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-3 py-1 rounded-t-md',
              activeTab === tab
                ? 'bg-white border-t border-l border-r'
                : 'hover:bg-gray-300',
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="text-sm" v-if="currentPage">
          <div v-if="activeTab === 'Meta Data'">
            <div class="metadata bg-gray-50 p-4 rounded-md border">
              <h3 class="text-md font-semibold mb-2">Metadata Validation</h3>

              <!-- Meta Title Validation -->
              <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
                <p class="font-bold">Meta Title Test</p>
                <p>
                  <strong>Text: </strong>
                  <span v-if="currentPage.title">{{
                    currentPage?.title || "No Meta Title Found"
                  }}</span>
                  <span v-else class="text-gray-400">No Meta Title Found</span>
                </p>
                <p>
                  <strong>Length: </strong>
                  <span v-if="currentPage.title_length">
                    {{ currentPage?.title_length || 0 }} characters
                  </span>
                  <span v-else class="text-gray-400">No Data</span>
                </p>
                <p v-if="!currentPage.title" class="text-red-500 font-bold">
                  ⚠️ No Meta Title detected. Ensure your page has a proper title
                  for better SEO.
                </p>
                <p
                  v-if="currentPage.is_title_duplicate"
                  class="text-red-500 font-bold"
                >
                  ⚠️ Duplicate Page Title Found
                </p>
                <p
                  v-if="
                    currentPage.title_length < 50 &&
                    currentPage.title_length > 0
                  "
                  class="text-yellow-500 font-bold"
                >
                  ⚠️ Title is Too Short
                </p>
                <p
                  v-if="currentPage.title_length > 60"
                  class="text-yellow-500 font-bold"
                >
                  ⚠️ Title is Too Long
                </p>
                <p
                  v-if="
                    currentPage.title_length >= 50 &&
                    currentPage.title_length <= 60
                  "
                  class="text-green-500 font-bold"
                >
                  ✅ Title is in the Ideal Range
                </p>
              </div>

              <!-- Meta Description Validation -->
              <div class="p-3 border-b bg-white shadow-md rounded-md">
                <p class="font-bold">Meta Description Test</p>
                <p>
                  <strong>Text: </strong>
                  <span v-if="currentPage.description">
                    {{ currentPage.description }}
                  </span>
                  <span v-else class="text-gray-400"
                    >No Meta Description Found</span
                  >
                </p>
                <p>
                  <strong>Length: </strong>
                  <span v-if="currentPage.description_length">
                    {{ currentPage.description_length }} characters
                  </span>
                  <span v-else class="text-gray-400">No Data</span>
                </p>
                <p
                  v-if="!currentPage.description"
                  class="text-red-500 font-bold"
                >
                  ⚠️ No Meta Description detected. Add a brief summary of your
                  page for better SEO.
                </p>
                <p
                  v-if="
                    currentPage.description_length < 150 &&
                    currentPage.description_length > 0
                  "
                  class="text-yellow-500 font-bold"
                >
                  ⚠️ Meta Description is Too Short
                </p>
                <p
                  v-if="currentPage.description_length > 220"
                  class="text-yellow-500 font-bold"
                >
                  ⚠️ Meta Description is Too Long
                </p>
                <p
                  v-if="
                    currentPage.description_length >= 150 &&
                    currentPage.description_length <= 220
                  "
                  class="text-green-500 font-bold"
                >
                  ✅ Meta Description is in the Ideal Range
                </p>
              </div>
            </div>

            <!-- Optional: still keep the issues panel below -->
          </div>

          <div v-else-if="activeTab === 'SOP Compliance'">
            <!-- 1. Quick Summary: SOP Compliance Overview -->
            <div class="p-4 mb-4 bg-gray-50 border rounded-md">
              <h3 class="font-semibold text-sm text-gray-700 mb-2">
                SOP Compliance Overview
              </h3>
              <p class="text-xs text-gray-500">
                Below is a quick summary of your compliance status. Items in
                <span class="text-red-500">red</span> need attention.
              </p>

              <!-- Progress Bar -->
              <div class="mt-2 bg-gray-200 h-2 w-full rounded-full">
                <div
                  class="bg-green-500 h-2 rounded-full"
                  :style="{ width: sopCompliancePercentage + '%' }"
                ></div>
              </div>
              <p class="mt-1 text-xs text-gray-700">
                {{ sopCompliancePassed }}/{{ sopComplianceTotal }} checks passed
                ({{ sopCompliancePercentage }}%)
              </p>
            </div>

            <!-- 2. Grouped Sections -->
            <div class="space-y-4">
              <!-- Contact Info -->
              <div class="p-4 bg-white border rounded-md shadow-sm">
                <h4 class="text-md font-semibold mb-3">Contact Info</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <!-- Phone Number -->
                  <div>
                    <strong>Phone Number: &nbsp;</strong>
                    <span
                      :class="{
                        'text-green-600': currentPage.sop?.phone_format_valid,
                        'text-red-500':
                          currentPage.sop?.phone_format_valid === false,
                      }"
                    >
                      {{ currentPage.phone_number || "—" }}
                    </span>
                  </div>

                  <!-- Email Address -->
                  <div>
                    <strong>Email Address: &nbsp;</strong>
                    <span
                      :class="{
                        'text-green-600': currentPage.sop?.email_format_valid,
                        'text-red-500':
                          currentPage.sop?.email_format_valid === false,
                      }"
                    >
                      {{ currentPage.email_address || "—" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Company Info -->
              <div class="p-4 bg-white border rounded-md shadow-sm">
                <h4 class="text-md font-semibold mb-3">Company Info</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <!-- Company Name -->
                  <div>
                    <strong>Company Name: &nbsp;</strong>
                    <span
                      :class="{
                        'text-green-600': currentPage.sop?.company_name_valid,
                        'text-red-500':
                          currentPage.sop?.company_name_valid === false,
                      }"
                    >
                      {{ currentPage.company_name || "—" }}
                    </span>
                  </div>

                  <!-- Address -->
                  <div>
                    <strong>Address: &nbsp;</strong>
                    <span
                      :class="{
                        'text-green-600': currentPage.sop?.address_format_valid,
                        'text-red-500':
                          currentPage.sop?.address_format_valid === false,
                      }"
                    >
                      {{ currentPage.address || "—" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Legal -->
              <div class="p-4 bg-white border rounded-md shadow-sm">
                <h4 class="text-md font-semibold mb-3">Legal</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <!-- Removed Privacy Policy -->
                  <div>
                    <strong>Copyright: &nbsp;</strong>
                    <span
                      :class="{
                        'text-green-600': currentPage.sop?.copyright_year_valid,
                        'text-red-500':
                          currentPage.sop?.copyright_year_valid === false,
                      }"
                    >
                      {{ currentPage.copyright || "—" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Chart Sidebar -->
    <!-- <div class="col-span-3 bg-white rounded text-sm max-h-96">
      <h3 class="font-semibold mb-2 text-base p-8">Validation Summary</h3>
      <PieChart :chart-data="chartData" />
    </div> -->
    <!-- Issues to Fix Section -->
    <div class="col-span-12 mt-4">
      <div class="issues-to-fix bg-white p-4 rounded-md">
        <h3 class="text-md font-semibold mb-2">🚨 Issues to Fix</h3>
        <div v-if="hasIssues" class="space-y-3">
          <div
            v-for="(issue, index) in filteredIssuesToFix"
            :key="index"
            class="flex items-center p-3 border-l-4 rounded-md shadow-sm transition-all duration-200 hover:shadow-lg"
            :class="{
              'bg-red-50 border-red-500': issue.priority === 'HIGH',
              'bg-yellow-50 border-yellow-500': issue.priority === 'MEDIUM',
              'bg-green-50 border-green-500': issue.priority === 'LOW',
            }"
          >
            <span
              class="text-xs font-bold px-3 py-1 min-w-20 text-center rounded"
              :class="{
                'bg-red-500 text-white': issue.priority === 'HIGH',
                'bg-yellow-500 text-white': issue.priority === 'MEDIUM',
                'bg-green-500 text-white': issue.priority === 'LOW',
              }"
            >
              {{ issue.priority }}
            </span>

            <p class="ml-4 text-gray-700 flex items-center">
              <a class="hover:text-blue-700">
                {{ issue.message }}
              </a>
            </p>
          </div>
        </div>
        <p v-else class="text-gray-500">✅ No critical issues found.</p>
      </div>

      <!-- Metadata Issues -->
      <div
        v-if="activeTab === 'Meta Data'"
        ref="metadataIssues"
        class="metadata-issues bg-white p-4 rounded-md mt-4"
        :class="{ 'highlight-section': highlight === 'metadata' }"
      >
        <h3 class="text-md font-semibold mb-2">📄 Metadata Issues</h3>
        <PageIssuesPanel
          :issues="currentPage?.issues || []"
          section="metadata"
        />
      </div>

      <!-- SOP Compliance Issues -->
      <div
        v-if="activeTab === 'SOP Compliance'"
        ref="sopIssues"
        class="sop-issues bg-white p-4 rounded-md mt-4"
        :class="{ 'highlight-section': highlight === 'sop' }"
      >
        <h3 class="text-sm font-semibold mb-2">🏢 SOP Compliance Issues</h3>
        <!-- <div v-if="sopIssues.length > 0" class="space-y-3">
          <div
            v-for="(issue, index) in sopIssues"
            :key="index"
            ref="sopIssueRefs"
            class="p-4 border rounded-md shadow-sm transition-all duration-300"
            :class="{
              'border-red-500 bg-red-50': issue.priority === 'HIGH',
              'border-yellow-500 bg-yellow-50': issue.priority === 'MEDIUM',
              'border-green-500 bg-green-50': issue.priority === 'LOW',
              highlighted:
                highlightedIssue === 'sop' && highlightedIndex === index,
            }"
          >
            <div class="flex items-center mb-2">
              <span class="text-lg mr-2">
                <i
                  v-if="issue.priority === 'HIGH'"
                  class="fa-solid fa-radiation text-red-800"
                ></i>
                <i
                  v-if="issue.priority === 'MEDIUM'"
                  class="fa-solid fa-triangle-exclamation text-yellow-500"
                ></i>
                <i
                  v-if="issue.priority === 'LOW'"
                  class="fa-solid fa-triangle-exclamation text-green-500"
                ></i>
              </span>
              <h4 class="text-md font-semibold">{{ issue.message }}</h4>
            </div>
            <p class="text-gray-700 text-sm">
              <strong>Why this matters:</strong>
              {{ getExplanation(issue) || "No explanation provided." }}
            </p>
            <a
              :href="issue.link"
              target="_blank"
              class="text-blue-500 underline mt-2 inline-block"
            >
              Learn More
            </a>
          </div>
        </div> -->
        <PageIssuesPanel :issues="currentPage?.issues || []" section="sop" />
        <!-- <PageIssuesPanel :issues="currentPage.issues || []" section="sop" /> -->
      </div>
    </div>
  </div>
</template>
<script>
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

import PageIssuesPanel from "@/components/validation/PageIssuesPanel.vue";

ChartJS.register(Title, Tooltip, Legend, ArcElement);
export default {
  name: "ValidationResults",
  // components: { PieChart, PageIssuesPanel },
  components: { PageIssuesPanel },
  props: {
    results: {
      type: Object,
      default: () => ({ pages: [] }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedPage: null,
      scanError: "",
      activeTab: "Meta Data",
      tabs: ["Meta Data", "SOP Compliance"],
      filters: {
        titleStatus: "",
        metaStatus: "",
        https: "",
        duplicateTitle: "",
      },
      searchQuery: "",
      highlight: null,
      highlightedIssue: null,
      highlightedIndex: null,
      passedChecks: 0,
      totalChecks: 0,
    };
  },
  computed: {
    compliancePercentage() {
      if (this.totalChecks === 0) return 0;
      return Math.round((this.passedChecks / this.totalChecks) * 100);
    },
    // How many SOP fields are valid
    sopCompliancePassed() {
      if (!this.currentPage?.sop) return 0;
      let count = 0;
      if (this.currentPage.sop.phone_format_valid) count++;
      if (this.currentPage.sop.email_format_valid) count++;
      if (this.currentPage.sop.address_format_valid) count++;
      if (this.currentPage.sop.company_name_valid) count++;
      if (this.currentPage.sop.copyright_year_valid) count++;
      return count;
    },
    // Total SOP checks (5 in this example)
    sopComplianceTotal() {
      return 5;
    },
    // Calculate SOP compliance percentage
    sopCompliancePercentage() {
      if (this.sopComplianceTotal === 0) return 0;
      return Math.round(
        (this.sopCompliancePassed / this.sopComplianceTotal) * 100
      );
    },
    filteredResults() {
      return (this.results.pages || []).filter((page) => {
        if (!page) return false;
        const matchTitle =
          this.filters.titleStatus === "" ||
          (this.filters.titleStatus === "ideal" && page.is_title_ideal) ||
          (this.filters.titleStatus === "short" && page.is_title_too_short) ||
          (this.filters.titleStatus === "long" &&
            !page.is_title_ideal &&
            !page.is_title_too_short);

        const matchMeta =
          this.filters.metaStatus === "" ||
          (this.filters.metaStatus === "missing" &&
            page.is_description_missing) ||
          (this.filters.metaStatus === "duplicate" &&
            page.is_description_duplicate) ||
          (this.filters.metaStatus === "valid" &&
            !page.is_description_missing &&
            !page.is_description_duplicate);

        const matchHttps =
          this.filters.https === "" || page.hasHttps === this.filters.https;
        const matchDupTitle =
          this.filters.duplicateTitle === "" ||
          (this.filters.duplicateTitle === "Yes" && page.is_title_duplicate) ||
          (this.filters.duplicateTitle === "No" && !page.is_title_duplicate);

        const matchSearch = page.url
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

        return (
          matchTitle && matchMeta && matchHttps && matchDupTitle && matchSearch
        );
      });
    },
    filteredIssuesToFix() {
      if (!this.currentPage || !this.currentPage.issues) return [];

      return (
        this.currentPage.issues.filter((issue) => {
          if (this.activeTab === "Meta Data") {
            return (
              issue.section === "metadata" &&
              !issue.message.toLowerCase().includes("https")
            );
          } else if (this.activeTab === "SOP Compliance") {
            return (
              issue.section === "sop" ||
              issue.message.toLowerCase().includes("https")
            );
          }
          return false;
        }) || []
      );
    },
    // currentPage() {
    //   return this.selectedPage !== null
    //     ? this.filteredResults[this.selectedPage]
    //     : {};
    // },
    currentPage() {
      return this.selectedPage !== null
        ? this.results.pages[this.selectedPage]
        : null;
    },

    chartData() {
      const errors = this.results.pages.filter(
        (p) =>
          p.is_description_missing ||
          (!p.is_title_ideal && !p.is_title_too_short) ||
          p.hasHttps === "No"
      ).length;

      const warnings = this.results.pages.filter(
        (p) => p.is_title_too_short || p.is_description_duplicate
      ).length;

      const valid = this.results.pages.length - errors - warnings;

      return {
        labels: ["Valid", "Warnings", "Errors"],
        datasets: [
          {
            data: [valid, warnings, errors],
            backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
          },
        ],
      };
    },
    hasIssues() {
      // return this.currentPage.issues && this.currentPage.issues.length > 0;
      return this.filteredIssuesToFix.length > 0;
    },
    allIssues() {
      if (!this.results.pages) return [];
      return this.results.pages.flatMap((page) => page.issues || []);
    },
    metadataIssues() {
      console.log(this.results.issues);

      return this.results.issues?.filter((i) => i.section === "metadata") || [];
    },
    sopIssues() {
      return this.results.issues?.filter((i) => i.section === "sop") || [];
    },
    // metadataIssues() {
    //   if (!this.currentPage || !this.currentPage.issues) return [];
    //   return this.currentPage.issues.filter((i) => i.section === "metadata");
    // },
    // sopIssues() {
    //   if (!this.currentPage || !this.currentPage.issues) return [];
    //   return this.currentPage.issues.filter((i) => i.section === "sop");
    // },
  },
  methods: {
    handleScanError(errorMessage) {
      this.scanError = errorMessage;
    },
    getExplanation(issue) {
      return issue.explanation || "";
    },
    selectPage(index) {
      const page = this.filteredResults[index];
      if (!page) {
        console.warn("Selected page not found in filteredResults.");
        return;
      }

      const originalIndex = this.results.pages.findIndex(
        (p) => p.url === page.url
      );
      if (originalIndex !== -1) {
        this.selectedPage = originalIndex;
        localStorage.setItem("selectedPageIndex", originalIndex);
        // Auto-scroll to "Details for" section
        this.$nextTick(() => {
          if (this.$refs.detailsSection) {
            this.$refs.detailsSection.scrollIntoView({ behavior: "smooth" });
          }
        });
      } else {
        console.warn("Page not found in original results.pages.");
      }
    },

    exportToCSV() {
      const rows = this.filteredResults.map((page) => ({
        URL: page.url,
        Title: page.title,
        MetaDescription: page.description,
        HTTPS: page.hasHttps,
        DuplicateTitle: page.is_title_duplicate ? "Yes" : "No",
        Phone: page.phone_number,
        Email: page.email_address,
        company_name: page.company_name,
        PhoneFormatValid: page.sop?.phone_format_valid ? "Yes" : "No",
        EmailFormatValid: page.sop?.email_format_valid ? "Yes" : "No",
        AddressFormatValid: page.sop?.address_format_valid ? "Yes" : "No",
        CompanyNameValid: page.sop?.company_name_valid ? "Yes" : "No",
        CopyrightValid: page.sop?.copyright_year_valid ? "Yes" : "No",
      }));

      if (rows.length === 0) {
        alert("No data available to export.");
        return;
      }

      const csv = [
        Object.keys(rows[0]).join(","),
        ...rows.map((row) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // link.download = "validation_results.csv";
      // Get company name from the first page that has it
      const companyName =
        this.filteredResults.find((p) => p.company_name)?.company_name ||
        "website";

      const sanitizedCompany = companyName.substring(0, 40); // optional length limit

      link.download = `${sanitizedCompany} Scanned Results.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  },
  mounted() {
    const savedIndex = localStorage.getItem("selectedPageIndex");
    if (savedIndex) {
      this.selectedPage = parseInt(savedIndex);
    }
  },
};
</script>
<style scoped>
.filters {
  background: #f0f7fe;
  font-size: 1rem;
  padding-inline: 0.5rem;
  border: none;
}
th {
  font-weight: 500;
  background: #f0f7fe;
}
th,
td {
  font-size: 1rem;
}
</style>
