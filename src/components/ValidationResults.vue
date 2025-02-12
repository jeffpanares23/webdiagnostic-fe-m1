<template>
  <div class="results-section bg-white p-6 rounded-lg shadow-md space-y-6">
    <h2 class="text-lg font-semibold mb-4">Validation Results</h2>

    <!-- Common SEO Issues -->
    <div>
      <h3 class="text-md font-semibold mb-2">Common SEO Issues</h3>
      <div class="grid grid-cols-3 gap-4 text-center border-b pb-4">
        <div class="text-red-500 font-semibold text-lg">
          <p>Failed:</p>
          <p>{{ results.seo_checks?.failed || 0 }}</p>
        </div>
        <div class="text-yellow-500 font-semibold text-lg">
          <p>Warnings:</p>
          <p>{{ results.seo_checks?.warnings || 0 }}</p>
        </div>
        <div class="text-green-500 font-semibold text-lg">
          <p>Passed:</p>
          <p>{{ results.seo_checks?.passed || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Metadata Validation (Page Title Analysis) -->
    <div class="metadata bg-gray-50 p-4 rounded-md border">
      <h3 class="text-md font-semibold mb-2">Metadata Validation</h3>
      <div class="p-3 border-b bg-white shadow-md rounded-md">
        <p class="font-bold text-green-600">✅ Meta Title Test</p>
        <p><strong>Text:</strong> {{ results.metadata?.title || "N/A" }}</p>
        <p>
          <strong>Length:</strong>
          {{ results.metadata?.title_length || 0 }} characters
        </p>
        <p v-if="!results.metadata?.title" class="text-red-500 font-bold">
          ⚠️ Missing Page Title
        </p>
        <p
          v-if="results.metadata?.duplicate_title"
          class="text-red-500 font-bold"
        >
          ⚠️ Duplicate Page Title Found
        </p>
        <p
          v-if="results.metadata?.title_length < 50"
          class="text-yellow-500 font-bold"
        >
          ⚠️ Title is Too Short
        </p>
        <p
          v-if="results.metadata?.title_length > 60"
          class="text-yellow-500 font-bold"
        >
          ⚠️ Title is Too Long
        </p>
        <p
          v-if="
            results.metadata?.title_length >= 50 &&
            results.metadata?.title_length <= 60
          "
          class="text-green-500 font-bold"
        >
          ✅ Title is in the Ideal Range
        </p>
      </div>
      <!-- Meta Description Validation -->
      <div
        class="p-4 border rounded-md"
        :class="{
          ' text-red-600':
            results.metadata.description_length < 150 ||
            results.metadata.description_length > 220,
          ' text-green-600':
            results.metadata.description_length >= 150 &&
            results.metadata.description_length <= 220,
        }"
      >
        <p class="font-semibold">
          <span
            v-if="
              results.metadata.description_length >= 150 &&
              results.metadata.description_length <= 220
            "
          >
            ✅ Meta Description Test
          </span>
          <span v-else>⚠️ Meta Description Test</span>
        </p>
        <p>
          <strong>Text:</strong>
          <span class="text-green-500">{{ results.metadata.description }}</span>
        </p>
        <p>
          <strong>Length:</strong>
          {{ results.metadata.description_length }} characters
        </p>
      </div>
    </div>

    <!-- Issues to Fix Section -->
    <div class="issues-to-fix">
      <h3 class="text-md font-semibold mb-2">🚨 Issues to Fix</h3>
      <div class="space-y-3">
        <div
          v-for="(issue, index) in results.issues"
          :key="index"
          class="flex items-center p-3 bg-red-50 border-l-4 border-red-500 rounded-md"
        >
          <span
            class="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded"
            >HIGH</span
          >
          <p class="ml-4 text-gray-700">
            <a
              :href="issue.link"
              target="_blank"
              class="text-blue-500 underline"
              >{{ issue.message }}</a
            >
          </p>
        </div>
      </div>
    </div>

    <!-- ✅ SOP Compliance Restored -->
    <div class="sop-compliance bg-white p-4 rounded-md border">
      <h3 class="text-md font-semibold mb-2">📋 SOP Compliance</h3>
      <div class="grid grid-cols-2 gap-4">
        <p>
          <strong>Company Name:</strong>
          {{ results.sop?.company_name || "N/A" }}
        </p>
        <p><strong>Address:</strong> {{ results.sop?.address || "N/A" }}</p>
        <p><strong>Phone:</strong> {{ results.sop?.phone_number || "N/A" }}</p>
        <p><strong>Email:</strong> {{ results.sop?.email_address || "N/A" }}</p>
        <p><strong>Copyright:</strong> {{ results.sop?.copyright || "N/A" }}</p>
      </div>
    </div>

    <!-- SEO Checks -->
    <div class="seo-checks">
      <h3 class="text-md font-semibold mb-2">🔍 SEO Checks</h3>
      <ul class="list-disc list-inside text-gray-700">
        <li>
          <strong>Has HTTPS:</strong>
          <span
            :class="
              results.seo_checks?.hasHttps ? 'text-green-500' : 'text-red-500'
            "
            >{{ results.seo_checks?.hasHttps ? "Yes" : "No" }}</span
          >
        </li>
        <li>
          <strong>Mobile Responsive:</strong>
          <span
            :class="
              results.seo_checks?.mobileResponsive
                ? 'text-green-500'
                : 'text-red-500'
            "
            >{{ results.seo_checks?.mobileResponsive ? "Yes" : "No" }}</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Object,
      default: () => ({
        metadata: {},
        sop: {},
        seo_checks: {},
        issues: [],
      }),
    },
  },
  methods: {
    getMetaDescriptionClass(length) {
      if (length >= 150 && length <= 220) {
        return "text-green-500";
      } else {
        return "text-yellow-500";
      }
    },
  },
};
</script>

<style scoped>
/* Responsive layout improvements */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
