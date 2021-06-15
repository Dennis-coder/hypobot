<template>
  <div
    class="
      w-full
      flex
      items-center
      flex-col
      bg-gray-40
      min-h-screen
      text-gray-200
    "
  >
    <main class="max-w-screen-lg w-full flex flex-col items-center">
      <div class="w-full flex mt-2">
        <div class="w-full">
          <h3>Input</h3>
          <textarea
            v-model="input"
            cols="30"
            rows="10"
            class="w-11/12 border bg-gray-70 focus:outline-none p-2"
          ></textarea>
        </div>
        <div class="w-full">
          <h3>Output</h3>
          <textarea
            v-model="output"
            cols="30"
            rows="10"
            class="w-11/12 border bg-gray-70 focus:outline-none p-2"
          ></textarea>
        </div>
      </div>
      <div class="space-x-2">
        <button @click="copyAll" class="button">Copy output</button>
        <button @click="clear" class="button">Clear text</button>
      </div>
      <div v-if="output.length > 1" class="space-x-2">
        <button
          v-for="pageNr in output.length"
          :key="pageNr"
          @click="copyPage(pageNr)"
          class="button"
        >
          Copy page {{ pageNr }}
        </button>
      </div>
      <div class="my-4">
        <h3>Preview</h3>
        <div ref="preview" class="preview" v-html="output"></div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { parser } from "./parser.js";
export default {
  name: "App",
  setup() {
    const input = ref("");
    const output = ref([]);
    const preview = ref(null);

    watch(input, (text, _prevText) => {
      let newHTMLList = parser(text);
      output.value = newHTMLList;
    })

    const copy = function (text) {
      let copy = document.createElement("textarea");
      copy.value = text;
      copy.setAttribute("readonly", "");
      document.body.appendChild(copy);
      copy.select();
      document.execCommand("copy");
      document.body.removeChild(copy);
      alert("Copied text to clipboard");
    };

    const copyPage = function (pageNr) {
      let text = output.value[pageNr - 1];
      copy(text);
    };

    const copyAll = function () {
      let text = "";
      output.value.forEach((page) => (text += page));
      copy(text);
    };

    const parse = function () {
      let newHTMLList = parser(input.value);
      output.value = newHTMLList;
    };

    const clear = function () {
      input.value = "";
      output.value = "";
    };

    return {
      input,
      output,
      preview,
      copyPage,
      copyAll,
      parse,
      clear,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.button {
  @apply mt-2 bg-blue-500 border-4 border-blue-500 rounded-full py-1 w-32 focus:outline-none hover:border-blue-600 focus:bg-blue-600;
}

.preview {
  width: 550px;
  padding: 50px;
  @apply bg-gray-70 text-left;
}

.preview h4 {
  margin: 25px 0 6px 0;
  padding: 0 0 0 10px;
  font-size: 17px;
  font-weight: 600;
}

.preview p {
  padding: 0 10px 10px 10px;
}

.preview ul {
  padding: 0 10px 0 30px;
  list-style-type: disc;
}

.preview li {
  margin-top: 5px;
}

.preview ul li:last-child,
.preview ol li:last-child {
  margin-bottom: 10px;
}
</style>
