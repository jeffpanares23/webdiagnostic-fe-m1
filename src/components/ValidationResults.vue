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
          <div v-if="activeTab === 'SEO Info'">
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
          </div>
          <div v-else-if="activeTab === 'SOP Compliance'">
            <p>
              <strong>Phone Format:</strong>
              {{
                currentPage.sop.phone_format_valid ? "✅ Valid" : "❌ Invalid"
              }}
            </p>
            <p>
              <strong>Email Format:</strong>
              {{
                currentPage.sop.email_format_valid ? "✅ Valid" : "❌ Invalid"
              }}
            </p>
            <p>
              <strong>Address Format:</strong>
              {{
                currentPage.sop.address_format_valid ? "✅ Valid" : "❌ Invalid"
              }}
            </p>
            <p>
              <strong>Company Name:</strong>
              {{
                currentPage.sop.company_name_valid ? "✅ Match" : "❌ Mismatch"
              }}
            </p>
            <p>
              <strong>Copyright Year:</strong>
              {{
                currentPage.sop.copyright_year_valid
                  ? "✅ Current"
                  : "❌ Outdated"
              }}
            </p>
            <PageIssuesPanel
              v-if="
                currentPage && currentPage.issues && currentPage.issues.length
              "
              :issues="currentPage.issues"
              section="sop"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Chart Sidebar -->
    <div class="col-span-3 bg-white border rounded p-3 text-sm">
      <h3 class="font-semibold mb-2">Validation Summary</h3>
      <PieChart :chart-data="chartData" />
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
  components: { PieChart },
  props: {
    results: {
      type: Object,
      default: () => ({ pages: [] }),
    },
  },
  data() {
    return {
      selectedPage: null,
      activeTab: "SEO Info",
      tabs: ["SEO Info", "Headers", "SOP Compliance"],
      filters: {
        titleStatus: "",
        metaStatus: "",
        https: "",
        duplicateTitle: "",
      },
      searchQuery: "",
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
    currentPage() {
      return this.selectedPage !== null
        ? this.filteredResults[this.selectedPage]
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
  },
  methods: {
    selectPage(index) {
      this.selectedPage = index;
      localStorage.setItem("selectedPageIndex", index);
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
