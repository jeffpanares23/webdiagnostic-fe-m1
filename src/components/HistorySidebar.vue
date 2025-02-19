<template>
  <div class="bg-white h-full p-6 w-100 rounded-xl overflow-hidden">
    <div class="sticky top-0 z-10 p-4 border-b">
      <h2 class="text-xl mb-4 text-gray-600">Web Diagnostic M1</h2>
      <input
        type="text"
        v-model="search"
        placeholder="Search..."
        class="w-full p-2 mb-4 border rounded-lg"
      />
    </div>
    <div class="overflow-y-auto max-h-screen pt-4 scrollbar-thin text-gray-600">
      <div v-for="(items, group) in filteredHistory" :key="group" class="mb-6">
        <h3 class="text-sm font-semibold text-gray-700 border-b pb-2 mb-2">
          {{ group }}
        </h3>
        <ul>
          <transition-group name="fade" tag="div">
            <li
              v-for="item in visibleItems(group, items)"
              :key="item.id"
              class="cursor-pointer hover:bg-gray-200 p-2 rounded flex items-center space-x-2 transition-all"
              @click="selectHistory(item)"
            >
              <i class="fas fa-link text-blue-500"></i>
              <span class="truncate">{{ item.url }}</span>
            </li>
          </transition-group>
        </ul>
        <button
          v-if="items.length > 5"
          @click="toggleExpanded(group)"
          class="text-blue-500 mt-2 text-sm hover:underline focus:outline-none"
        >
          {{ expanded[group] ? "See Less" : "See More" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["history"],
  data() {
    return {
      search: "",
      expanded: {},
    };
  },
  computed: {
    filteredHistory() {
      if (!this.search) {
        return this.history;
      }

      // Filter history based on search input
      const query = this.search.toLowerCase();
      const filtered = {};

      for (const [group, items] of Object.entries(this.history)) {
        const matchedItems = items.filter((item) =>
          item.url.toLowerCase().includes(query)
        );
        if (matchedItems.length) {
          filtered[group] = matchedItems;
        }
      }

      return filtered;
    },
  },
  methods: {
    visibleItems(group, items) {
      return this.expanded[group] ? items : items.slice(0, 5);
    },
    toggleExpanded(group) {
      this.expanded[group] = !this.expanded[group];
    },
    selectHistory(item) {
      this.$emit("select", item);
      this.$emit("updateUrl", item.url);
    },
  },
};
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #edf2f7;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #edf2f7;
}

.sticky.border-b {
  box-shadow: 0px 5px 2px -2px #0000002b;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
