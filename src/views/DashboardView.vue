<template>
  <div class="flex flex-col lg:flex-row p-6 max-w-7xl m-auto">
    <!-- Sidebar -->
    <div
      class="lg:w-1/4 w-full shadow-md lg:relative fixed inset-y-0 left-0 z-10 h-full overflow-y-auto"
    >
      <HistorySidebar
        :history="history"
        @select="handleHistorySelect"
        @updateUrl="websiteUrl = $event"
      />
    </div>

    <!-- Main Content -->
    <div
      class="lg:w-3/4 w-full flex-1 p-4 pt-0 lg:ml-1/4 container mx-auto space-y-6"
    >
      <SubNavigation />
      <WebsiteInput
        @loading="setLoading"
        @results="handleResults"
        v-model="websiteUrl"
      />

      <!-- Tabs -->
      <div v-if="results">
        <div class="tabs flex space-x-4 border-b">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="py-2 px-4"
            :class="{
              'border-b-2 border-blue-500': activeTab === tab,
              'text-gray-500': activeTab !== tab,
            }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'Results'">
        <ValidationResults v-if="results" :results="results" />
        <ExportButtons v-if="results" :results="results" />
      </div>
      <!-- <div v-if="activeTab === 'Content Analysis'">
        <p class="text-gray-700">Content Analysis feature coming soon...</p>
      </div> -->
      <!-- Placeholder Image (Only Show When No Results Exist) -->
      <div v-if="!results" class="flex justify-center items-center mt-10">
        <img
          src="@/assets/Web-search.gif"
          alt="Start Scanning"
          class="w-1/3 opacity-75"
        />
      </div>
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
      currentYear: new Date().getFullYear(), //Auto Update na ni nga Copyright
    };
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/diagnostic-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        this.history = response.data;
      } catch (error) {
        console.error(
          "Failed to fetch history:",
          error.response?.data || error
        );
      }
    },
    handleHistorySelect(selectedResult) {
      console.log("Selected History Data:", selectedResult); // Debugging

      // ✅ Auto-fill the input field
      this.websiteUrl = selectedResult.url;

      this.results = selectedResult; // Ensure SOP Compliance details are included
    },
    handleResults(newResults) {
      this.loading = false;
      console.log("API Response:", newResults);
      this.results = newResults;
      this.fetchHistory();
    },
    setLoading() {
      this.loading = true;
    },
  },
};
</script>
