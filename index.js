// import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/+esm";

const { createApp, ref } = Vue;

createApp({
  setup() {
    const newTask = ref("");
    const lists = ref({
      ideabox: [],
      urgent: [],
      important: [],
      done: []
    });

    const listTitles = {
      ideabox: "IDEABOX",
      urgent: "緊急",
      important: "重要",
      done: "已完成"
    };

    const addTask = () => {
      const text = newTask.value.trim();
      if (text) {
        lists.value.ideabox.push({
          id: Date.now(),
          text,
          done: false
        });
        newTask.value = "";
      }
    };

    const clearCompleted = () => {
      lists.value.done = [];
    };

    const setSortable = (el, listName) => {
      if (!el) return;
      Sortable.create(el, {
        group: "tasks",
        animation: 150,
        onAdd(evt) {
          const fromList = evt.from.dataset.list;
          const toList = listName;
          const movedItem = lists.value[fromList].splice(evt.oldIndex, 1)[0];
          lists.value[toList].splice(evt.newIndex, 0, movedItem);
        },
        onStart() {
          // 在拖曳開始時記住是哪個清單
          el.dataset.list = listName;
        }
      });
    };

    return {
      newTask,
      lists,
      listTitles,
      addTask,
      clearCompleted,
      setSortable
    };
  }
}).mount("#app");
