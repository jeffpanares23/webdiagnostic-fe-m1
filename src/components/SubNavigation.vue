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

    <!-- Logout Icon (Hidden if Embedded) -->
    <div v-if="!isEmbedded" class="relative group">
      <button @click="logout" class="text-gray-600 hover:text-red-500">
        <i class="fas fa-sign-out-alt text-2xl"></i>
      </button>
      <!-- Tooltip -->
      <div
        class="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-md"
      >
        Logout
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "", // Holds the search query
      isEmbedded: false, // Flag to check if embeddedzzzzzzzzz
    };
  },
  mounted() {
    this.isEmbedded = window.self !== window.top; // Detect if inside an iframe
  },
  methods: {
    searchDiagnostics() {
      console.log("Searching for:", this.searchQuery);
    },
    logout() {
      sessionStorage.removeItem("token"); // Clear authentication token
      this.$router.push("/"); // Redirect to login page
    },
  },
};
</script>

<style scoped>
.sub-navigation {
  border-bottom: 1px solid #e5e7eb;
}
</style>
