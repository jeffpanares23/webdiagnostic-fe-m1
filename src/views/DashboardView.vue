<template>
  <div class="flex flex-col lg:flex-row p-6 max-w-7xl m-auto">
    <!-- 📌 Sidebar Toggle Button for Mobile -->
    <button
      class="lg:hidden bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      @click="sidebarOpen = !sidebarOpen"
    >
      ☰ History
    </button>

    <!-- 📌 Overlay when Sidebar is Open -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- 📌 Sidebar Drawer -->
    <div
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
    </div>

    <!-- 📌 Main Content -->
    <div class="lg:w-3/4 w-full flex-1 p-4 pt-0 container mx-auto space-y-6">
      <SubNavigation />

      <!-- 📌 Improved Search Input -->
      <WebsiteInput
        class="input-box"
        placeholder="Enter website URL..."
        @loading="setLoading"
        @results="handleResults"
        v-model="websiteUrl"
      />

      <!-- 📌 Tabs Navigation -->
      <div v-if="results">
        <div class="tabs flex space-x-4 border-b">
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
        <ExportButtons v-if="results" :results="results" />
      </div>

      <!-- 📌 Empty State Message with Tips -->
      <div v-if="!results" class="text-center mt-10">
        <img
          src="@/assets/Web-search.gif"
          class="w-2/3 md:w-1/3 opacity-75 m-auto"
        />
        <p class="text-gray-500 mt-4">
          Start diagnosing a website by entering a URL above.
        </p>
        <p class="text-sm text-gray-400">Try: www.example.com</p>
      </div>

      <!-- 📌 Loading Indicator -->
      <transition name="fade">
        <div v-if="loading" class="text-center text-gray-500">
          Scanning website...
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import SubNavigation from "../components/SubNavigation.vue";
import WebsiteInput from "../components/WebsiteInput.vue";
import ValidationResults from "../components/ValidationResults.vue";
import ExportButtons from "../components/ExportButtons.vue";
import HistorySidebar from "../components/HistorySidebar.vue";
import axios from "axios";
import baseUrl from "../config";

export default {
  components: {
    SubNavigation,
    WebsiteInput,
    ValidationResults,
    ExportButtons,
    HistorySidebar,
  },
  data() {
    return {
      websiteUrl: "",
      loading: false,
      results: null,
      tabs: ["Results"],
      activeTab: "Results",
      history: {},
      sidebarOpen: false, // 📌 Controls Sidebar Visibility
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
    // handleResults(newResults) {
    //   this.loading = false;
    //   this.results = newResults;
    //   this.fetchHistory();
    // },
    handleResults(newResults) {
      this.loading = false;

      // ✅ Ensure newResults is always valid
      this.results = {
        ...newResults,
        issues: Array.isArray(newResults.issues) ? newResults.issues : [],
      };

      this.fetchHistory();
    },
    setLoading() {
      this.loading = true;
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
.input-box {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.3s ease;
}
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
  border-bottom: 2px solid #3b82f6;
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
