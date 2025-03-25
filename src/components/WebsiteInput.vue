<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-semibold mb-4">Run Diagnostic</h2>
    <div class="flex justify-between items-center">
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
        class="bg-blue-500 text-white py-3 px-6 rounded-lg flex items-center justify-center transition"
        :disabled="loading"
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
          <!-- If hasScanned is true, show "Scan Another" else "GO!" -->
          {{ hasScanned ? "Scan Another Website" : "GO!" }}
        </span>
      </button>
    </div>
    <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";
import baseUrl from "../config";

export default {
  name: "WebsiteInput",
  props: {
    modelValue: String, // existing v-model binding
    hasScanned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "loading", "results", "reset"], // Declare emitted events

  data() {
    return {
      errorMessage: "",
      loading: false,
    };
  },
  computed: {
    websiteUrl: {
      get() {
        return this.modelValue || ""; // Get value from parent
      },
      set(value) {
        this.$emit("update:modelValue", value); // Update parent when input changes
      },
    },
  },
  methods: {
    handleButtonClick() {
      // If we've already scanned, the user wants to start a fresh scan
      if (this.hasScanned && !this.loading) {
        // Emit an event to reset in the parent
        this.$emit("reset");
        return;
      }

      // Otherwise, proceed with scanning
      this.submitUrl();
    },

    async submitUrl() {
      this.errorMessage = "";
      this.loading = true;
      this.$emit("loading");

      if (!this.websiteUrl || this.websiteUrl.trim() === "") {
        this.errorMessage = "Please enter a valid URL.";
        this.loading = false;
        return;
      }

      let formattedUrl = this.websiteUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "http://" + formattedUrl;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        const response = await axios.post(
          `${baseUrl}/api/analyze-website`,
          { url: formattedUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data || response.data.error) {
          throw new Error(
            response.data.error || "Invalid response from server."
          );
        }

        console.log(response.data);
        const pagesData = response.data.pages.map((page) => ({
          url: page.url,
          title: page.title || "N/A",
          title_length: page.title_length || "N/A",
          description: page.description || "N/A",
          description_length: page.description_length || "N/A",
          hasHttps: page.hasHttps ? "Yes" : "No",
          address: page.address || "N/A",
          phone: page.phone_number || "N/A",
          email: page.email_address || "N/A",
          company_name: page.company_name || "N/A",
          copyright: page.copyright || "N/A",
          sop: page.sop || {},
          issues: page.issues || [],
        }));

        // Emit all pages data
        this.$emit("results", { pages: pagesData });
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error ||
          "An error occurred while processing the URL.";
        console.error("API Error:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
