import IntersectionObserverMock from "@/mocks/IntersectionObserverMock";

window.IntersectionObserver = IntersectionObserverMock as jest.Mock;
