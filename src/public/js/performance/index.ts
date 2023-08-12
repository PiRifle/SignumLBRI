import $ from "jquery"

export function registerPerformance(usingTailwind: boolean) {
    const timeStart = Date.now();
    $("a")
        .not(".no-override")
        .on("click", (event: any) => {
            const navigateToHREF = new URL(
                location.origin + event.target.getAttribute("href"),
            );
            if (navigateToHREF.origin == location.origin) {
                let params = new URLSearchParams(navigateToHREF.search);
                params.set("performance", (Date.now() - timeStart).toString());
                navigateToHREF.search = params.toString();
                $(event.target).attr("href", navigateToHREF.toString());
            }
        });
    $("form").on("submit", (event: any) => {
        var element = document.createElement("input");
        element.setAttribute("name", "performance");
        element.setAttribute("value", (Date.now() - timeStart).toString());
        if (usingTailwind) { element.classList.add("hidden") } else { element.classList.add("d-none"); }
        event.target.append(element);
    });
}