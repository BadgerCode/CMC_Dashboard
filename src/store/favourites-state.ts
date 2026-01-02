import { reactive } from "vue";

export interface FavouritePainting {
  id: string;
  favouritedAt: string;
}

export interface FavouriteArtist {
  name: string;
  favouritedAt: string;
}

export const favouritesStore = reactive({
  paintings: [] as FavouritePainting[],
  artists: [] as FavouriteArtist[],

  // Data management
  load() {
    let rawData = localStorage.getItem("favourites");
    if (rawData != null) {
      let favouritesData = JSON.parse(rawData);
      this.paintings = favouritesData.paintings;
      this.artists = favouritesData.artists;
    }
  },

  save() {
    localStorage.setItem("favourites", JSON.stringify({
      paintings: this.paintings,
      artists: this.artists
    }));
  },


  // Favourite paintings
  addPainting(painting: FavouritePainting) {
    this.paintings.push(painting);
    this.save();
  },
  removePainting(paintingId: string) {
    let index = this.paintings.findIndex(p => p.id == paintingId);
    if (index !== -1) {
      this.paintings.splice(index, 1);
    }

    this.save();
  }

  // Favourite artists

});
