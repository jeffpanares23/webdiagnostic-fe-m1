<template>
  <div class="grid grid-cols-12 gap-4">
    <!-- Left: Main Results Table -->
    <div class="col-span-9">
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
        <select v-model="filters.titleStatus" class="border p-1 rounded">
          <option value="">All Titles</option>
          <option value="ideal">Ideal</option>
          <option value="short">Too Short</option>
          <option value="long">Too Long</option>
        </select>
        <select v-model="filters.metaStatus" class="border p-1 rounded">
          <option value="">All Meta</option>
          <option value="valid">Valid</option>
          <option value="missing">Missing</option>
          <option value="duplicate">Duplicate</option>
        </select>
        <select v-model="filters.https" class="border p-1 rounded">
          <option value="">All HTTPS</option>
          <option value="Yes">HTTPS</option>
          <option value="No">HTTP</option>
        </select>
        <select v-model="filters.duplicateTitle" class="border p-1 rounded">
          <option value="">Duplicate Title?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search URL..."
          class="border p-1 rounded col-span-2"
        />
      </div>

      <!-- Results Table -->
      <div class="overflow-y-auto max-h-[420px] border rounded text-xs">
        <table class="w-full">
          <thead class="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th class="px-2 py-1">#</th>
              <th class="px-2 py-1">URL</th>
              <th class="px-2 py-1">Title</th>
              <th class="px-2 py-1">Meta Desc</th>
              <th class="px-2 py-1">HTTPS</th>
              <th class="px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(page, index) in filteredResults"
              :key="index"
              class="hover:bg-blue-50 border-b cursor-pointer"
              @click="selectPage(index)"
            >
              <td class="px-2 py-1 text-center">{{ index + 1 }}</td>
              <td class="px-2 py-1 text-blue-600 underline break-all">
                {{ page.url }}
              </td>
              <td class="px-2 py-1">{{ page.title }}</td>
              <td class="px-2 py-1">{{ page.description || "—" }}</td>
              <td class="px-2 py-1">{{ page.hasHttps }}</td>
              <td class="px-2 py-1">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Panel: Tabbed Page Details -->
      <div
        v-if="selectedPage !== null"
        class="mt-4 border rounded p-3 bg-gray-50"
      >
        <div class="mb-2">
          <h3 class="font-semibold text-sm">
            Details for:
            <span class="text-blue-600">{{ currentPage.url }}</span>
          </h3>
        </div>
        <div class="flex space-x-4 border-b pb-2 text-sm">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-3 py-1 rounded-t-md',
              activeTab === tab
                ? 'bg-white border-t border-l border-r'
                : 'bg-gray-200 hover:bg-gray-300',
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-3 text-sm">
          <!-- <div v-if="activeTab === 'Meta Data'">
            <p><strong>Title:</strong> {{ currentPage.title }}</p>
            <p><strong>Title Length:</strong> {{ currentPage.title_length }}</p>
            <p>
              <strong>Meta Description:</strong>
              {{ currentPage.description || "Missing" }}
            </p>
            <p><strong>HTTPS:</strong> {{ currentPage.hasHttps }}</p>
            <p>
              <strong>Duplicate Title:</strong>
              {{ currentPage.is_title_duplicate ? "Yes" : "No" }}
            </p>
            <PageIssuesPanel
              v-if="
                currentPage && currentPage.issues && currentPage.issues.length
              "
              :issues="currentPage.issues"
              section="metadata"
            />
          </div>
          <div v-else-if="activeTab === 'Headers'">
            <p v-for="header in currentPage.headers" :key="header">
              - {{ header }}
            </p>
          </div> -->
          <div v-if="activeTab === 'Meta Data'">
            <div class="metadata bg-gray-50 p-4 rounded-md border">
              <h3 class="text-md font-semibold mb-2">Metadata Validation</h3>

              <!-- Meta Title Validation -->
              <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
                <p class="font-bold">Meta Title Test</p>
                <p>
                  <strong>Text: </strong>
                  <span v-if="currentPage.title">{{ currentPage.title }}</span>
                  <span v-else class="text-gray-400">No Meta Title Found</span>
                </p>
                <p>
                  <strong>Length: </strong>
                  <span v-if="currentPage.title_length">
                    {{ currentPage.title_length }} characters
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
            <p>
              <strong>Phone Number:</strong> {{ currentPage?.phone || "—" }}
            </p>
            <p>
              <strong>Phone Format:</strong>
              {{
                currentPage.sop?.phone_format_valid === true
                  ? "✅ Valid"
                  : currentPage.sop?.phone_format_valid === false
                  ? "❌ Invalid"
                  : "—"
              }}
            </p>
            <p>
              <strong>Email Address:</strong> {{ currentPage?.email || "—" }}
            </p>
            <p>
              <strong>Email Format:</strong>
              {{
                currentPage.sop?.email_format_valid === true
                  ? "✅ Valid"
                  : currentPage.sop?.email_format_valid === false
                  ? "❌ Invalid"
                  : "—"
              }}
            </p>
            <p><strong>Address:</strong> {{ currentPage?.address || "—" }}</p>
            <p>
              <strong>Address Format:</strong>
              {{
                currentPage.sop?.address_format_valid === true
                  ? "✅ Valid"
                  : currentPage.sop?.address_format_valid === false
                  ? "❌ Invalid"
                  : "—"
              }}
            </p>
            <p>
              <strong>Company Name:</strong>
              {{ currentPage?.company_name || "—" }}
            </p>
            <!-- <p>
              <strong>Company Name Match:</strong>
              {{
                currentPage.sop?.company_name_valid === true
                  ? "✅ Match"
                  : currentPage.sop?.company_name_valid === false
                  ? "❌ Mismatch"
                  : "—"
              }}
            </p> -->
            <p>
              <strong>Copyright:</strong> {{ currentPage?.copyright || "—" }}
            </p>
            <p>
              <strong>Copyright Year:</strong>
              {{
                currentPage.sop?.copyright_year_valid === true
                  ? "✅ Current"
                  : currentPage.sop?.copyright_year_valid === false
                  ? "❌ Outdated"
                  : "—"
              }}
            </p>
            <PageIssuesPanel :issues="currentPage.issues || []" section="sop" />
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Chart Sidebar -->
    <div class="col-span-3 bg-white border rounded p-3 text-sm">
      <h3 class="font-semibold mb-2">Validation Summary</h3>
      <PieChart :chart-data="chartData" />
    </div>
    <!-- Issues to Fix Section -->
    <div class="col-span-12 mt-4">
      <div class="issues-to-fix bg-white p-4 rounded-md border">
        <h3 class="text-md font-semibold mb-2">🚨 Issues to Fix</h3>
        <div v-if="hasIssues" class="space-y-3">
          <div
            v-for="(issue, index) in filteredIssuesToFix"
            :key="index"
            class="flex items-center p-3 border-l-4 rounded-md shadow-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
            :class="{
              'bg-red-50 border-red-500': issue.priority === 'HIGH',
              'bg-yellow-50 border-yellow-500': issue.priority === 'MEDIUM',
              'bg-green-50 border-green-500': issue.priority === 'LOW',
            }"
            @click="scrollToSection(issue.section)"
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
        ref="metadataIssues"
        class="metadata-issues bg-white p-4 rounded-md border mt-4"
        :class="{ 'highlight-section': highlight === 'metadata' }"
      >
        <h3 class="text-md font-semibold mb-2">📄 Metadata Issues</h3>
        <!-- <div v-if="metadataIssues.length > 0" class="space-y-3">
          <div
            v-for="(issue, index) in metadataIssues"
            :key="index"
            class="p-4 border rounded-md shadow-sm transition-all duration-300"
            :class="{
              'border-red-500 bg-red-50': issue.priority === 'HIGH',
              'border-yellow-500 bg-yellow-50': issue.priority === 'MEDIUM',
              'border-green-500 bg-green-50': issue.priority === 'LOW',
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
        <PageIssuesPanel
          :issues="currentPage.issues || []"
          section="metadata"
        />
      </div>

      <!-- SOP Compliance Issues -->
      <div
        ref="sopIssues"
        class="sop-issues bg-white p-4 rounded-md border mt-4"
        :class="{ 'highlight-section': highlight === 'sop' }"
      >
        <h3 class="text-md font-semibold mb-2">🏢 SOP Compliance Issues</h3>
        <div v-if="sopIssues.length > 0" class="space-y-3">
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
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import PieChart from "@/components/PieChart.vue";
import PageIssuesPanel from "@/components/validation/PageIssuesPanel.vue";

ChartJS.register(Title, Tooltip, Legend, ArcElement);
export default {
  name: "ValidationResults",
  components: { PieChart, PageIssuesPanel },
  props: {
    results: {
      type: Object,
      default: () => ({ pages: [] }),
    },
  },
  data() {
    return {
      selectedPage: null,
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
    };
  },
  computed: {
    filteredResults() {
      return this.results.pages.filter((page) => {
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

      return this.currentPage.issues.filter((issue) => {
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
      });
    },
    // currentPage() {
    //   return this.selectedPage !== null
    //     ? this.filteredResults[this.selectedPage]
    //     : {};
    // },
    currentPage() {
      return this.selectedPage !== null
        ? this.results.pages[this.selectedPage]
        : {};
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
    // metadataIssues() {
    //   console.log(this.results.issues);

    //   return this.results.issues?.filter((i) => i.section === "metadata") || [];
    // },
    // sopIssues() {
    //   return this.results.issues?.filter((i) => i.section === "sop") || [];
    // },
    metadataIssues() {
      if (!this.currentPage || !this.currentPage.issues) return [];
      return this.currentPage.issues.filter((i) => i.section === "metadata");
    },
    sopIssues() {
      if (!this.currentPage || !this.currentPage.issues) return [];
      return this.currentPage.issues.filter((i) => i.section === "sop");
    },
  },
  methods: {
    // selectPage(index) {
    //   this.selectedPage = index;
    //   localStorage.setItem("selectedPageIndex", index);
    // },
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
        Phone: page.phone,
        Email: page.email,
        company_name: page.company_name,
        PhoneFormatValid: page.sop?.phone_format_valid ? "Yes" : "No",
        EmailFormatValid: page.sop?.email_format_valid ? "Yes" : "No",
        AddressFormatValid: page.sop?.address_format_valid ? "Yes" : "No",
        CompanyNameValid: page.sop?.company_name_valid ? "Yes" : "No",
        CopyrightValid: page.sop?.copyright_year_valid ? "Yes" : "No",
      }));

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
      link.download = "validation_results.csv";
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
