<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-semibold mb-4">Run Diagnostic</h2>
    <form
      @submit.prevent="handleButtonClick"
      class="flex justify-between items-center"
    >
      <input
        v-model="websiteUrl"
        type="url"
        class="flex-grow border rounded-lg p-3 text-gray-700 mr-4"
        placeholder="Enter URL or paste text here"
        :disabled="loading || hasScanned"
        required
      />
      <button
        type="button"
        @click="handleButtonClick"
        :class="[
          'py-3 px-6 rounded-lg flex items-center justify-center transition',
          loading || !isValidUrl(websiteUrl.trim())
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer',
        ]"
        :disabled="loading || !isValidUrl(websiteUrl.trim())"
      >
        <span v-if="loading" class="flex items-center">
          <svg
            class="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Scanning...
        </span>
        <span v-else>
          {{ hasScanned ? "Scan Another Website" : "GO!" }}
        </span>
      </button>
    </form>

    <!-- Optional error display -->
    <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";
import baseUrl from "../config";

export default {
  name: "WebsiteInput",
  props: {
    modelValue: String,
    hasScanned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "loading", "results", "reset", "error"],

  data() {
    return {
      errorMessage: "",
      loading: false,
    };
  },

  computed: {
    websiteUrl: {
      get() {
        return this.modelValue || "";
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    isValidUrl(value) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" +
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})" +
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
          "(\\?[;&a-z\\d%_.~+=-]*)?" +
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return !!pattern.test(value);
    },

    handleButtonClick() {
      if (this.hasScanned && !this.loading) {
        this.errorMessage = "";
        this.$emit("error", "");
        this.$emit("reset");
        return;
      }
      this.submitUrl();
    },

    async submitUrl() {
      this.errorMessage = "";
      this.loading = true;
      this.$emit("loading");

      const formattedUrl = this.websiteUrl.trim();
      if (!this.isValidUrl(formattedUrl)) {
        this.errorMessage = "Invalid URL format. Please enter a valid URL.";
        this.loading = false;
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        // Step 1: Send URL to backend to start queued job
        const startRes = await axios.post(
          `${baseUrl}/api/analyze-website`,
          { url: formattedUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const jobId = startRes.data.job_id;
        if (!jobId) throw new Error("No job ID returned.");

        // Step 2: Start polling scan status
        this.pollScanStatus(jobId);
      } catch (err) {
        this.errorMessage =
          err.response?.data?.error || "Error initiating scan.";
        this.$emit("error", this.errorMessage);
        this.loading = false;
      }
    },

    pollScanStatus(jobId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${baseUrl}/api/scan-status/${jobId}`
          );
          const result = response.data;

          if (result.status === "done") {
            clearInterval(interval);
            this.$emit("results", result.data);
            this.loading = false;
          } else if (result.status === "error") {
            clearInterval(interval);
            this.errorMessage = result.message || "Scan failed.";
            this.$emit("error", this.errorMessage);
            this.loading = false;
          }
          // else: still processing — keep polling
        } catch (error) {
          clearInterval(interval);
          this.errorMessage =
            error.response?.data?.error || "Error polling scan result.";
          this.$emit("error", this.errorMessage);
          this.loading = false;
        }
      }, 3000); // ⏱ Poll every 3 seconds
    },
  },
};
</script>
