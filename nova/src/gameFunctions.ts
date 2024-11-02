const strings = {
  placeholder:
    "This is some placeholder text. You will be prompted about what to do next. Type what you'd like to do in the input line.",
};

export async function callApi(query: String) {
  // call api
  try {
    return strings.placeholder + " You last typed: " + query;
  } catch (error) {
    throw new Error("Error calling API");
  }
}
