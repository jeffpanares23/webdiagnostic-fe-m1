<template>
  <div class="flex flex-col lg:flex-row p-6 m-auto">
    <!-- 📌 Sidebar Toggle Button for Mobile -->
    <!-- <button
      class="lg:hidden bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      @click="sidebarOpen = !sidebarOpen"
    >
      ☰ History
    </button> -->

    <!-- 📌 Overlay when Sidebar is Open -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- 📌 Sidebar Drawer -->
    <!-- <div
      class="lg:w-1/4 w-full shadow-md lg:relative fixed inset-y-0 left-0 z-20 h-full overflow-y-auto bg-white transform transition-transform lg:translate-x-0"
      :class="{
        '-translate-x-full': !sidebarOpen,
        'translate-x-0': sidebarOpen,
      }"
    >
      <button
        class="lg:hidden absolute top-4 right-4 text-gray-600"
        @click="sidebarOpen = false"
      >
        ✖
      </button>
      <HistorySidebar
        :history="history"
        @select="handleHistorySelect"
        @updateUrl="websiteUrl = $event"
      />
    </div> -->

    <!-- 📌 Main Content -->
    <div class="lg:w-3/4 w-full flex-1 p-4 pt-0 container mx-auto">
      <SubNavigation />

      <!-- 📌 Improved Search Input -->
      <WebsiteInput
        class="input-box"
        placeholder="Enter website URL..."
        @loading="setLoading"
        @results="handleResults"
        @reset="resetScan"
        @error="handleScanError"
        v-model="websiteUrl"
        :hasScanned="hasScanned"
      />

      <div
        v-if="scanError && !loading"
        class="flex justify-between items-center text-red-600 bg-red-50 p-6 rounded shadow mt-6"
      >
        <div>
          <h3 class="text-lg font-semibold mb-2">
            Oops! Something went wrong.
          </h3>
          <p>{{ scanError }}</p>
        </div>
        <button @click="scanError = ''" class="text-red-500 hover:text-red-700">
          ✖
        </button>
      </div>

      <!-- 📌 Tabs Navigation -->
      <div v-if="results">
        <div class="tabs flex space-x-4">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- 📌 Tab Content -->
      <div v-if="activeTab === 'Results'">
        <ValidationResults v-if="results" :results="results" />
      </div>

      <!-- Illustration -->
      <div v-if="!results && !loading" class="mt-10">
        <img
          src="@/assets/illustrations/diagnostic-illustration.png"
          alt="Website Diagnostic Illustration"
          class="w-2/3 md:w-1/2 m-auto"
        />
      </div>
      <transition name="slide-expand">
        <div
          v-if="loading"
          class="w-full bg-blue-50 p-8 flex flex-col justify-center items-center text-center shadow-lg transition-all duration-500"
        >
          <h3 class="text-lg font-semibold mb-4">Analyzing Website Data...</h3>
          <p class="text-gray-600">{{ loadingInsight }}</p>
          <div class="progress-bar mt-4">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>

          <div class="w-full mt-4">
            <table class="w-full">
              <thead class="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th class="px-2 py-1">#</th>
                  <th class="px-2 py-1">URL</th>
                  <th class="px-2 py-1">Title</th>
                  <th class="px-2 py-1">Meta Desc</th>
                  <th class="px-2 py-1">HTTPS</th>
                  <!-- <th class="px-2 py-1">Status</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="n in 5" :key="n" class="border-b">
                  <td class="px-2 py-1 text-center flex justify-center">
                    <div
                      class="animate-pulse bg-gray-300 h-4 w-4 rounded"
                    ></div>
                  </td>
                  <td class="px-2 py-1">
                    <div
                      class="animate-pulse bg-gray-300 h-4 w-full rounded"
                    ></div>
                  </td>
                  <td class="px-2 py-1">
                    <div
                      class="animate-pulse bg-gray-300 h-4 w-full rounded"
                    ></div>
                  </td>
                  <td class="px-2 py-1">
                    <div
                      class="animate-pulse bg-gray-300 h-4 w-full rounded"
                    ></div>
                  </td>
                  <td class="px-2 py-1">
                    <div
                      class="animate-pulse bg-gray-300 h-4 w-8 rounded"
                    ></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import SubNavigation from "../components/SubNavigation.vue";
import WebsiteInput from "../components/WebsiteInput.vue";
import ValidationResults from "../components/ValidationResults.vue";
import axios from "axios";
import baseUrl from "../config";

export default {
  components: {
    SubNavigation,
    WebsiteInput,
    ValidationResults,
  },
  data() {
    return {
      websiteUrl: "",
      loading: false,
      progress: 0,
      loadingInsight: "Initializing...",
      insights: [
        "Checking server response time...",
        "Verifying SSL security...",
        "Analyzing website load performance...",
        "Scanning SEO metrics...",
        "Optimizing user experience...",
      ],
      results: null,
      tabs: ["Results"],
      activeTab: "Results",
      history: {},
      sidebarOpen: false, // 📌 Controls Sidebar Visibility
      scanError: "",
      hasScanned: false,
    };
  },
  mounted() {
    this.fetchHistory();
  },
  computed: {
    filteredIssues() {
      // ✅ Ensure `results` exists and `issues` is an array before filtering
      if (!this.results || !Array.isArray(this.results.issues)) {
        return []; // Return an empty array if undefined
      }
      return this.results.issues.filter((issue) => issue.type === "error");
    },
  },
  methods: {
    async fetchHistory() {
      const token = localStorage.getItem("token");

      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/diagnostic-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.history = response.data;
      } catch (error) {
        console.error(
          "Failed to fetch history:",
          error.response?.data || error
        );
      }
    },
    handleHistorySelect(selectedResult) {
      this.websiteUrl = selectedResult.url;
      this.results = selectedResult;
      this.sidebarOpen = false; // 📌 Close sidebar on mobile after selecting
    },
    handleResults(newResults) {
      this.loading = false;
      this.scanError = "";
      // ✅ Ensure newResults is always valid
      this.results = {
        ...newResults,
        issues: Array.isArray(newResults.issues) ? newResults.issues : [],
      };

      this.hasScanned = true;
      this.fetchHistory();
    },
    handleScanError(errorMessage) {
      this.loading = false;
      this.results = null;
      this.scanError = errorMessage;
    },
    setLoading() {
      this.loading = true;
      this.startLoadingAnimation();
    },
    startLoadingAnimation() {
      let index = 0;
      this.progress = 0;

      const interval = setInterval(() => {
        if (this.progress >= 100) {
          clearInterval(interval);
        } else {
          this.progress += 5;
          // Rotate through your insights array
          this.loadingInsight = this.insights[index % this.insights.length];
          index++;
        }
      }, 3000);
    },
    resetScan() {
      // Clear everything for a new scan
      this.hasScanned = false;
      this.results = null;
      this.websiteUrl = "";
      this.scanError = "";
    },
  },
};
</script>

<style scoped>
/* 📌 Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 15;
  transition: opacity 0.3s ease-in-out;
}

.progress-bar {
  width: 80%;
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #3498db;
  transition: width 3s ease;
}

/* Optional for the slide-expand transition */
.slide-expand-enter-active,
.slide-expand-leave-active {
  transition: all 3s ease;
}
.slide-expand-enter-from,
.slide-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 📌 Sidebar Drawer Transition for Mobile */
@media (max-width: 1024px) {
  .translate-x-0 {
    transform: translateX(0);
  }
  .-translate-x-full {
    transform: translateX(-100%);
  }
}

/* 📌 Improved Search Input */
/* .input-box {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.3s ease;
} */
.input-box:focus {
  border-color: #3b82f6;
  box-shadow: 0px 0px 8px rgba(59, 130, 246, 0.3);
}

/* 📌 Tabs Styling */
.tab {
  padding: 10px 16px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}
.tab:hover {
  background-color: #f9fafb;
}
.tab.active {
  font-weight: bold;
}

/* 📌 Fade-In Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 📌 Mobile Optimization */
@media (max-width: 640px) {
  .tab {
    padding: 12px 18px;
    font-size: 14px;
  }
  .input-box {
    padding: 12px;
  }
}
</style>
