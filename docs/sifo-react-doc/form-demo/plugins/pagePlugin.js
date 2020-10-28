const pagePlugin = {
  afterRender: ({ mApi }) => {
    console.log("afterRender!!!!");
    mApi.setValue("subject", "值123");
  },
};

export default pagePlugin;
