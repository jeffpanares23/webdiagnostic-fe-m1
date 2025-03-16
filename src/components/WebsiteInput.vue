<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-semibold mb-4">Run Diagnostic</h2>
    <div class="flex justify-between items-center">
      <input
        v-model="websiteUrl"
        type="url"
        class="flex-grow border rounded-lg p-3 text-gray-700 mr-4"
        placeholder="Enter URL or paste text here"
        required
      />
      <button
        type="button"
        @click="submitUrl"
        class="bg-blue-500 text-white py-3 px-6 rounded-lg flex items-center justify-center transition"
        :disabled="loading"
      >
        <span v-if="!loading">GO!</span>
        <span v-else class="flex items-center">
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
          Loading...
        </span>
      </button>
    </div>
    <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["modelValue"], // Bind to parent component
  emits: ["update:modelValue", "loading", "results"], // Declare emitted events

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
    async submitUrl() {
      this.errorMessage = "";
      this.loading = true;
      this.$emit("loading"); // Trigger loading state in parent component

      // Ensure websiteUrl is defined and not empty
      if (!this.websiteUrl || this.websiteUrl.trim() === "") {
        this.errorMessage = "Please enter a valid URL.";
        this.loading = false; // Stop loading state if input is empty
        return;
      }

      let formattedUrl = this.websiteUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "http://" + formattedUrl; // ✅ Ensure protocol exists
      }

      const token = sessionStorage.getItem("token");
      console.log(token);

      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        const response = await axios.post(
          "https://bdt.proweaver.tools/web-diagnostic-api/public/api/analyze-website",
          { url: formattedUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data || response.data.error) {
          throw new Error(
            response.data.error || "Invalid response from server."
          );
        }

        console.log(response.data);

        const processedData = {
          url: formattedUrl,
          metadata: response.data.metadata || {},
          sop: response.data.sop || {},
          seo_checks: response.data.seo_checks || {},
          issues: response.data.issues || [],
        };

        this.$emit("results", processedData);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error ||
          "An error occurred while processing the URL.";
        console.error("API Error:", error);
      } finally {
        this.loading = false; // ✅ Stop loading state after API call
      }
    },
  },
};
</script>
