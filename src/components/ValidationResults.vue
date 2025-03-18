<template>
  <div class="results-container">
    <!-- Existing Sections for Metadata, SEO, and SOP Results -->

    <!-- New Section for Displaying Scanned Pages -->
    <div class="scanned-pages">
      <h2 class="text-lg font-semibold mb-4">Scanned Pages</h2>
      <div v-if="results.pages.length">
        <table class="w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-4 py-2">#</th>
              <th class="border border-gray-300 px-4 py-2">URL</th>
              <th class="border border-gray-300 px-4 py-2">Title</th>
              <th class="border border-gray-300 px-4 py-2">Title Length</th>
              <th class="border border-gray-300 px-4 py-2">Description</th>
              <th class="border border-gray-300 px-4 py-2">
                Description Length
              </th>
              <th class="border border-gray-300 px-4 py-2">HTTPS</th>
              <th class="border border-gray-300 px-4 py-2">Copyright</th>
              <th class="border border-gray-300 px-4 py-2">Contact Info</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(page, index) in results.pages" :key="index">
              <td class="border border-gray-300 px-4 py-2">{{ index + 1 }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <a
                  :href="page.url"
                  target="_blank"
                  class="text-blue-500 underline"
                >
                  {{ page.url }}
                </a>
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ page.title }}</td>
              <td class="border border-gray-300 px-4 py-2">
                {{ page.title_length }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ page.description }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ page.description_length }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <span
                  :class="{
                    'text-green-500': page.hasHttps === 'Yes',
                    'text-red-500': page.hasHttps === 'No',
                  }"
                >
                  {{ page.hasHttps }}
                </span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ page.copyright }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <p><strong>Address:</strong> {{ page.address }}</p>
                <p><strong>Phone:</strong> {{ page.phone }}</p>
                <p><strong>Email:</strong> {{ page.email }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500">No pages found.</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Object,
      default: () => ({ pages: [] }),
    },
  },
};
</script>

<style scoped>
th,
td {
  text-align: left;
  padding: 8px;
}
</style>
