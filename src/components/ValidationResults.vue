<template>
  <div class="results-section bg-white p-6 rounded-lg shadow-md space-y-6">
    <h2 class="text-lg font-semibold mb-4">Validation Results</h2>

    <!-- Common SEO Issues -->
    <!-- <div>
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
    </div> -->

    <!-- Metadata Validation (Page Title Analysis) -->
    <div class="metadata bg-gray-50 p-4 rounded-md border">
      <h3 class="text-md font-semibold mb-2">Metadata Validation</h3>
      <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
        <p class="font-bold">Meta Title Test</p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.metadata?.title">
            {{ results.metadata?.title }}
          </span>
          <span v-else class="text-gray-400">No Meta Title Found</span>
        </p>
        <p>
          <strong>Length: </strong>
          <span v-if="results.metadata?.title_length">
            {{ results.metadata?.title_length }} characters
          </span>
          <span v-else class="text-gray-400">No Data</span>
        </p>
        <p v-if="!results.metadata?.title" class="text-red-500 font-bold">
          ⚠️ No Meta Title detected. Ensure your page has a proper title for
          better SEO.
        </p>
        <p
          v-if="results.metadata?.duplicate_title"
          class="text-red-500 font-bold"
        >
          ⚠️ Duplicate Page Title Found
        </p>
        <p
          v-if="
            results.metadata?.title_length < 50 &&
            results.metadata?.title_length > 0
          "
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
      <div class="p-3 border-b bg-white shadow-md rounded-md">
        <p class="font-bold">Meta Description Test</p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.metadata?.description">
            {{ results.metadata?.description }}
          </span>
          <span v-else class="text-gray-400">No Meta Description Found</span>
        </p>
        <p>
          <strong>Length: </strong>
          <span v-if="results.metadata?.description_length">
            {{ results.metadata?.description_length }} characters
          </span>
          <span v-else class="text-gray-400">No Data</span>
        </p>
        <p v-if="!results.metadata?.description" class="text-red-500 font-bold">
          ⚠️ No Meta Description detected. Add a brief summary of your page for
          better SEO.
        </p>
        <p
          v-if="
            results.metadata?.description_length < 150 &&
            results.metadata?.description_length > 0
          "
          class="text-yellow-500 font-bold"
        >
          ⚠️ Meta Description is Too Short
        </p>
        <p
          v-if="results.metadata?.description_length > 220"
          class="text-yellow-500 font-bold"
        >
          ⚠️ Meta Description is Too Long
        </p>
        <p
          v-if="
            results.metadata?.description_length >= 150 &&
            results.metadata?.description_length <= 220
          "
          class="text-green-500 font-bold"
        >
          ✅ Meta Description is in the Ideal Range
        </p>
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
    <div class="sop-compliance bg-white p-4 rounded-md border">
      <h3 class="text-md font-semibold mb-2">📋 SOP Compliance</h3>

      <!-- Company Name -->
      <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
        <p class="font-bold">Company Name</p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.sop?.company_name">
            {{ results.sop?.company_name }}
          </span>
          <span v-else class="text-gray-400">No Company Name Found</span>
        </p>
      </div>

      <!-- Address Validation -->
      <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
        <p class="font-bold">
          Address
          <span
            class="tooltip"
            title="Example: 123 Main St., Suite 200, NY 10001"
            >ℹ️</span
          >
        </p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.sop?.address">
            {{ results.sop?.address }}
          </span>
          <span v-else class="text-gray-400">No Address Found</span>
        </p>
        <p :class="validateAddress(results.sop?.address)">
          <strong>Validation:</strong>
          <span
            v-if="validateAddress(results.sop?.address) === 'text-green-500'"
          >
            ✅ Address is in the correct format.
          </span>
          <span v-else class="text-red-500">
            ⚠️ Address format may be incorrect. (Expected: 12345 Main St., Suite
            100)
          </span>
        </p>
      </div>

      <!-- Phone Number Validation -->
      <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
        <p class="font-bold">
          Phone Number
          <span class="tooltip" title="Expected format: 123-456-7890">ℹ️</span>
        </p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.sop?.phone_number">
            {{ results.sop?.phone_number }}
          </span>
          <span v-else class="text-gray-400">No Phone Number Found</span>
        </p>
        <p :class="validatePhone(results.sop?.phone_number)">
          <strong>Validation:</strong>
          <span
            v-if="validatePhone(results.sop?.phone_number) === 'text-green-500'"
          >
            ✅ Phone number is correctly formatted.
          </span>
          <span v-else class="text-red-500">
            ⚠️ Phone number format is incorrect (Expected: 123-456-7890).
          </span>
        </p>
      </div>

      <!-- Email Validation -->
      <div class="p-3 border-b bg-white shadow-md rounded-md mb-2">
        <p class="font-bold">Email</p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.sop?.email_address">
            {{ results.sop?.email_address }}
          </span>
          <span v-else class="text-gray-400">No Email Found</span>
        </p>
        <p :class="validateEmail(results.sop?.email_address)">
          <strong>Validation:</strong>
          <span
            v-if="
              validateEmail(results.sop?.email_address) === 'text-green-500'
            "
          >
            ✅ Email format is correct.
          </span>
          <span v-else class="text-red-500">
            ⚠️ Email format may be incorrect.
          </span>
        </p>
      </div>

      <!-- Copyright Validation -->
      <div class="p-3 border-b bg-white shadow-md rounded-md">
        <p class="font-bold">Copyright</p>
        <p>
          <strong>Text: </strong>
          <span v-if="results.sop?.copyright">
            {{ results.sop?.copyright }}
          </span>
          <span v-else class="text-gray-400"
            >No Copyright Information Found</span
          >
        </p>
        <p :class="validateCopyright(results.sop?.copyright)">
          <strong>Validation:</strong>
          <span
            v-if="
              validateCopyright(results.sop?.copyright) === 'text-green-500'
            "
          >
            ✅ Copyright year is correct.
          </span>
          <span v-else class="text-red-500">
            ⚠️ Copyright year may be outdated.
          </span>
        </p>
      </div>
    </div>

    <!-- SEO Checks -->
    <div class="seo-checks bg-white p-4 rounded-md border">
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

    <!-- Issues to Fix Section -->
    <div class="issues-to-fix bg-white p-4 rounded-md border">
      <h3 class="text-md font-semibold mb-2">🚨 Issues to Fix</h3>
      <div v-if="hasIssues" class="space-y-3">
        <div
          v-for="(issue, index) in results.issues"
          :key="index"
          class="flex items-center p-3 border-l-4 rounded-md shadow-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
          :class="{
            'bg-red-50 border-red-500': issue.priority === 'HIGH',
            'bg-yellow-50 border-yellow-500': issue.priority === 'MEDIUM',
            'bg-green-50 border-green-500': issue.priority === 'LOW',
          }"
          @click="scrollToSection(issue.section)"
        >
          <!-- Priority Label -->
          <span
            class="text-xs font-bold px-3 py-1 min-w-20 text-center rounded"
            :class="{
              'bg-red-500 text-white': issue.priority === 'HIGH',
              'bg-yellow-500 text-white': issue.priority === 'MEDIUM',
              'bg-green-500 text-white': issue.priority === 'LOW',
            }"
          >
            {{ issue.priority }}
          </span>

          <!-- Issue Message -->
          <p class="ml-4 text-gray-700 flex items-center">
            <a class="hover:text-blue-700">
              {{ issue.message }}
            </a>
          </p>
        </div>
      </div>

      <!-- Ensure fallback message if no issues are detected -->
      <p v-else class="text-gray-500">✅ No critical issues found.</p>
    </div>

    <!-- Metadata Issues Section -->
    <div
      ref="metadataIssues"
      class="metadata-issues bg-white p-4 rounded-md border mt-4"
      :class="{
        'highlight-section': highlight === 'metadata',
      }"
    >
      <h3 class="text-md font-semibold mb-2">📄 Metadata Issues</h3>
      <div v-if="metadataIssues.length > 0" class="space-y-3">
        <div
          v-for="(issue, index) in metadataIssues"
          :key="index"
          class="p-4 border rounded-md shadow-sm transition-all duration-300"
          :class="{
            'border-red-500 bg-red-50': issue.priority === 'HIGH',
            'border-yellow-500 bg-yellow-50': issue.priority === 'MEDIUM',
            'border-green-500 bg-green-50': issue.priority === 'LOW',
          }"
        >
          <div class="flex items-center mb-2">
            <span class="text-lg mr-2">
              <span v-if="issue.priority === 'HIGH'">
                <i class="fa-solid fa-radiation text-red-800"></i>
              </span>
              <span v-if="issue.priority === 'MEDIUM'">
                <i class="fa-solid fa-triangle-exclamation text-yellow-500"></i>
              </span>
              <span v-if="issue.priority === 'LOW'">
                <i class="fa-solid fa-triangle-exclamation text-green-500"></i>
              </span>
            </span>
            <h4 class="text-md font-semibold">{{ issue.message }}</h4>
          </div>
          <p class="text-gray-700 text-sm">
            <strong>Why this matters:</strong>
            {{ getExplanation(issue) || "No explanation provided." }}
          </p>
          <a
            :href="issue.link"
            target="_blank"
            class="text-blue-500 underline mt-2 inline-block"
            >Learn More</a
          >
        </div>
      </div>
    </div>

    <!-- SOP Compliance Issues Section -->
    <div
      ref="sopIssues"
      class="sop-issues bg-white p-4 rounded-md border mt-4"
      :class="{ 'highlight-section': highlight === 'sop' }"
    >
      <h3 class="text-md font-semibold mb-2">🏢 SOP Compliance Issues</h3>
      <div v-if="sopIssues.length > 0" class="space-y-3">
        <div
          v-for="(issue, index) in sopIssues"
          :key="index"
          ref="sopIssueRefs"
          class="p-4 border rounded-md shadow-sm transition-all duration-300"
          :class="{
            'border-red-500 bg-red-50': issue.priority === 'HIGH',
            'border-yellow-500 bg-yellow-50': issue.priority === 'MEDIUM',
            'border-green-500 bg-green-50': issue.priority === 'LOW',
            highlighted:
              highlightedIssue === 'sop' && highlightedIndex === index,
          }"
        >
          <!-- Title & Icon -->
          <div class="flex items-center mb-2">
            <span class="text-lg mr-2">
              <span v-if="issue.priority === 'HIGH'">
                <i class="fa-solid fa-radiation text-red-800"></i>
              </span>
              <span v-if="issue.priority === 'MEDIUM'">
                <i class="fa-solid fa-triangle-exclamation text-yellow-500"></i>
              </span>
              <span v-if="issue.priority === 'LOW'">
                <i class="fa-solid fa-triangle-exclamation text-green-500"></i>
              </span>
            </span>
            <h4 class="text-md font-semibold">{{ issue.message }}</h4>
          </div>
          <p class="text-gray-700 text-sm">
            <strong>Why this matters:</strong>
            {{ getExplanation(issue) || "No explanation provided." }}
          </p>
          <a
            :href="issue.link"
            target="_blank"
            class="text-blue-500 underline mt-2 inline-block"
            >Learn More</a
          >
        </div>
      </div>
    </div>
  </div>
  <!-- Back to Top Button -->
  <!-- <button
    v-show="showBackToTop"
    @click="scrollToTop"
    class="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
  >
      ↑ Back to Top
    </button> -->
  <button
    data-twe-ripple-init
    data-twe-ripple-color="light"
    v-show="showBackToTop"
    @click="scrollToTop"
    class="fixed bottom-6 right-6 bg-blue-300 text-white px-2 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
  >
    <span class="[&>svg]:w-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
        />
      </svg>
    </span>
  </button>
</template>

<script>
export default {
  data() {
    return {
      highlightedIndex: null,
      highlightedIssue: null,
      showBackToTop: false,
      highlight: "",
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll); // Listen for scroll events
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll); // Cleanup listener
  },
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
    scrollToSection(section) {
      this.$nextTick(() => {
        let targetRef = null;
        if (section === "metadata") {
          targetRef = this.$refs.metadataIssues;
        } else if (section === "sop") {
          targetRef = this.$refs.sopIssues;
        }

        if (targetRef) {
          targetRef.scrollIntoView({ behavior: "smooth" });
          this.highlight = section;

          // Remove highlight effect after 2 seconds
          setTimeout(() => {
            this.highlight = "";
          }, 2000);
        } else {
          console.warn(`Section ref not found: ${section}`);
        }
      });
    },

    getExplanation(issue) {
      const explanations = {
        "Title is below the recommended length (50-60 characters).":
          "A short title can negatively affect SEO ranking and might not provide enough context in search results.",
        "Meta description is outside the ideal length range (150-220 characters).":
          "A meta description that is too long or too short may be cut off in search results, reducing its effectiveness.",
        "Company Name is missing from the website.":
          "A missing company name can lead to confusion and lack of brand credibility for visitors.",
        "Company Phone Number is missing. Users may have trouble contacting the business.":
          "Without a phone number, potential customers may struggle to reach your business, affecting sales and support.",
        "Copyright year is missing. Ensure your website displays a valid copyright year.":
          "An outdated or missing copyright year can make a website appear neglected, reducing user trust.",
      };

      return explanations[issue.message] || "No explanation provided.";
    },

    // Address Validation (Basic Check for Format)
    validateAddress(address) {
      if (!address) return "text-red-500";
      const addressPattern =
        /\d+.*\b(?:Ave\.|Blvd\.|St\.|Hwy\.|Rd\.|Ln\.|Fwy\.|Ct\.|Dr\.|Pkwy\.|Bldg\.|Fl\.|Ste\.|NW|NE|SW|SE|N|S|E|W)\b/i;
      return addressPattern.test(address) ? "text-green-500" : "text-red-500";
    },

    // Phone Number Validation (Must follow XXX-XXX-XXXX)
    validatePhone(phone) {
      if (!phone) return "text-red-500";
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
      return phonePattern.test(phone) ? "text-green-500" : "text-red-500";
    },

    // Email Validation (Basic Format Check)
    validateEmail(email) {
      if (!email) return "text-red-500";
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(email) ? "text-green-500" : "text-red-500";
    },

    // Copyright Validation (Should be Current Year)
    validateCopyright(copyright) {
      const currentYear = new Date().getFullYear();
      return copyright && copyright.includes(currentYear.toString())
        ? "text-green-500"
        : "text-red-500";
    },

    handleScroll() {
      this.showBackToTop = window.scrollY > 300; // Show button after scrolling down
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smoothly scroll to top
    },
  },
  computed: {
    hasIssues() {
      return this.results?.issues?.length > 0;
    },
    // sortedIssues() {
    //   if (!this.results.issues) return [];

    //   // Ensure each issue retains its original index before sorting
    //   return this.results.issues
    //     .map((issue, index) => ({ ...issue, originalIndex: index }))
    //     .sort((a, b) => {
    //       const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    //       return priorityOrder[a.priority] - priorityOrder[b.priority];
    //     });
    // },
    // metadataIssues() {
    //   return this.sortedIssues.filter((issue) => issue.section === "metadata");
    // },
    // sopIssues() {
    //   return this.sortedIssues.filter((issue) => issue.section === "sop");
    // },
    metadataIssues() {
      return this.results.issues.filter(
        (issue) => issue.section === "metadata"
      );
    },
    sopIssues() {
      return this.results.issues.filter((issue) => issue.section === "sop");
    },
  },
};
</script>

<style scoped>
.tooltip {
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  margin-left: 5px;
}
.border-red-500 {
  border-left-width: 5px;
}
.border-yellow-500 {
  border-left-width: 5px;
}
.border-green-500 {
  border-left-width: 5px;
}
.highlight-section {
  animation: highlightEffect 2s ease-in-out;
}

@keyframes highlightEffect {
  0% {
    background-color: rgba(255, 223, 186, 0.5);
  }
  50% {
    background-color: rgba(255, 223, 186, 1);
  }
  100% {
    background-color: rgba(255, 223, 186, 0.5);
  }
}

@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
