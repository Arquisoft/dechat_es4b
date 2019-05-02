/**
 * A class with helper methods for read and write of Solid PODs.
 */
class DataSync {

  /**
   * The constructor initiates a DataSync instance.
   */
  constructor(fetch) {
    this.fetch = fetch;
  }

  /**
   * This method deletes a file.
   * @param url: the url of the file that needs to be deleted.
   * @returns {Promise}: the promise from auth.fetch().
   */
  deleteFileForUser(url) {
    return this.fetch(url, {
      method: "DELETE"
    });
  }
}

module.exports = DataSync;
