<template>
  <div
    class="sub-navigation bg-white rounded-lg p-4 flex items-center justify-between"
  >
    <!-- Navigation History -->
    <div class="nav-history text-xl text-gray-600">
      <!-- <span>Apps</span> / -->
      <span>Website Diagnostic Tool </span>
      <span class="text-xs text-blue-500">Version M.1.0</span>
    </div>

    <!-- Search Bar -->
    <!-- <div class="search-bar flex items-center">
      <input
        type="text"
        v-model="searchQuery"
        class="border border-gray-300 rounded-lg px-4 py-2 w-72"
        placeholder="Search diagnostics..."
      />
      <button
        class="ml-2 px-4 py-2 bg-gray-200 text-white rounded-lg hover:cursor-no-drop"
        @click="searchDiagnostics"
      >
        Search
      </button>
    </div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "", // Holds the search query
    };
  },
  methods: {
    searchDiagnostics() {
      console.log("Searching for:", this.searchQuery);
    },
  },
};
</script>

<style scoped>
.sub-navigation {
  border-bottom: 1px solid #e5e7eb;
}
</style>
