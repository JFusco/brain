// Opening a node focuses the scene, and the scene's labels open nodes. Injecting the opener
// here lets scene and panel modules navigate without importing the details view.
let opener = () => {};

export function setNavigator(open) {
  opener = open;
}

export function navigate(id) {
  return opener(id);
}
