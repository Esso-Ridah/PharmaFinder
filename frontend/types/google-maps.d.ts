declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
      };
    };
  }
}

export {};