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
    <nav class="w-full bg-blue-600"></nav>

    <main class="max-w-screen-lg w-full flex flex-col items-center">
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
      <div class="space-x-2">
        <button @click="parse" class="button">Parse</button>
        <button @click="copyToClipboard" class="button">Copy output</button>
        <button @click="clear" class="button">Clear text</button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { parser } from "./parser.js";
export default {
  name: "App",
  setup() {
    const input = ref("");
    const output = ref("");

    const copyToClipboard = function () {
      let copy = document.createElement("textarea");
      copy.value = output.value;
      copy.setAttribute("readonly", "");
      document.body.appendChild(copy);
      copy.select();
      document.execCommand("copy");
      document.body.removeChild(copy);
      alert("Copied text to clipboard");
    };

    const parse = function () {
      let newHTML = parser(input.value);
      output.value = newHTML;
    };

    const clear = function () {
      input.value = "";
      output.value = "";
    };

    return {
      input,
      output,
      copyToClipboard,
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
  @apply mt-2 bg-blue-500 border-4 border-blue-500 rounded-full py-1 px-2 focus:outline-none hover:border-blue-600 focus:bg-blue-600;
}
</style>
