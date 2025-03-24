<template>
  <div class="space-y-4">
    <div
      v-for="(issue, idx) in filteredIssues"
      :key="idx"
      class="border-l-4 p-4 rounded shadow-sm"
      :class="{
        'border-red-500 bg-red-50': issue.priority === 'HIGH',
        'border-yellow-400 bg-yellow-50': issue.priority === 'MEDIUM',
        'border-green-500 bg-green-50': issue.priority === 'LOW',
      }"
    >
      <div class="flex items-center justify-between mb-1">
        <h4 class="font-semibold text-sm">
          <span class="mr-2">📌</span> {{ issue.message }}
        </h4>
        <!-- <span
          class="text-xs font-bold px-2 py-1 rounded-full"
          :class="{
            'bg-red-500 text-white': issue.priority === 'HIGH',
            'bg-yellow-500 text-white': issue.priority === 'MEDIUM',
            'bg-green-500 text-white': issue.priority === 'LOW',
          }"
        >
          {{ issue.priority }}
        </span> -->
      </div>
      <div class="text-xs mb-1">
        <strong>Why this matters:</strong>
        {{ issue.reason || "This affects your SEO or compliance visibility." }}
      </div>
      <a
        v-if="issue.link"
        :href="issue.link"
        target="_blank"
        class="text-blue-600 text-xs underline"
      >
        Learn More
      </a>
    </div>
    <div v-if="filteredIssues.length === 0" class="text-sm text-gray-500">
      ✅ No issues found in this section.
    </div>
  </div>
</template>

<script>
export default {
  name: "PageIssuesPanel",
  props: {
    issues: {
      type: Array,
      default: () => [],
    },
    section: {
      type: String,
      required: true,
    },
  },
  computed: {
    filteredIssues() {
      return this.issues.filter((i) => {
        // Avoid showing HTTPS issues in metadata section
        if (
          this.section === "metadata" &&
          i.message?.toLowerCase().includes("https")
        ) {
          return false;
        }
        return i.section === this.section;
      });
    },
  },
};
</script>
