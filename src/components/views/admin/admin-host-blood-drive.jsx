/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import { format } from "date-fns";
import { Pagination, Modal, Toast } from "flowbite-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Filters from "../../sections/filterable/filter-host-drive";
import DeleteConfirmationModal from "../../utils/modal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AdminHostBloodDrive() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driveToUpdate, setDriveToUpdate] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [driveToDelete, setDriveToDelete] = useState(null);
  const [provinces, setProvinces] = useState([]);

  const [filters, setFilters] = useState({
    location: "",
    scheduledDate: "",
    searchBy: "all",
    query: "",
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/province`);
        setProvinces(response.data.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  const toastDuration = 3000;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), toastDuration);
      return () => clearTimeout(timer);
    }
  }, [showToast, toastDuration]);

  const fetchBloodDrives = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found. User must be logged in.");
        return;
      }

      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      ).toString();

      const response = await axios.get(
        `${BASE_URL}/blood-drive?page=${currentPage}&limit=${limit}&${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const formattedData = response.data.data.bloodDrives.map((drive) => ({
        ...drive,
        ScheduledDate: format(
          new Date(drive.ScheduledDate),
          "yyyy-MM-dd HH:mm:ss"
        ),
        Location: drive.Province.Name,
      }));

      setData(formattedData);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching blood drives:", error);
    }
  };

  useEffect(() => {
    fetchBloodDrives();
  }, [currentPage, limit, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      location: "",
      scheduledDate: "",
      searchBy: "all",
      query: "",
    });
  };

  const handleDelete = (drive) => {
    setDriveToDelete(drive);
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. User must be logged in.");
      }

      const response = await axios.delete(
        `${BASE_URL}/blood-drive/${driveToDelete.DriveID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setToastMessage(
        response.data.message || "Blood drive deleted successfully"
      );
      setIsError(false);
      setShowToast(true);
      fetchBloodDrives();
      setIsDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting the blood drive:", error);
      setToastMessage("Error deleting blood drive");
      setIsError(true);
      setShowToast(true);
      setIsDeleteConfirmationOpen(false);
    }
  };

  const handleUpdateClick = (drive) => {
    setDriveToUpdate(drive);
    setIsModalOpen(true);
  };

  const handleUpdateBloodDrive = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. User must be logged in.");
      }

      const response = await axios.put(
        `${BASE_URL}/blood-drive/${driveToUpdate.DriveID}`,
        {
          institute: driveToUpdate.Institute,
          location: driveToUpdate.Location,
          designation: driveToUpdate.Designation,
          scheduledDate: driveToUpdate.ScheduledDate,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setToastMessage(
        response.data.message || "Blood drive updated successfully"
      );
      setIsError(false);
      setShowToast(true);
      fetchBloodDrives(); 
    } catch (error) {
      let errorMessage = "An error occurred while updating the blood drive.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      setToastMessage(errorMessage);
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleChange = (e, field) => {
    setDriveToUpdate({ ...driveToUpdate, [field]: e.target.value });
  };

  const tableHeader = [
    "No.",
    "UserID",
    "Institute",
    "Location",
    "Designation",
    "ScheduledDate",
  ];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <HeaderStats heading="Blood Drive Management" />
      <div className="bg-white p-10 m-10 -mt-20 rounded-rsm">
        <Filters
          provinces={provinces}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          dateFilterName="scheduledDate"
          dateFilterLabel="Scheduled Date"
        />
        <div className="overflow-x-scroll">
          {showToast && (
            <Toast
              position="top-center"
              onClose={() => setShowToast(false)}
              title={isError ? "Error" : "Success"}
              color={isError ? "failure" : "success"}
              className="shadow-lg border-2 border-blue"
            >
              {toastMessage}
              <button onClick={() => setShowToast(false)} className="text-red">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Toast>
          )}
          <DisplayTableComponent
            tableHeader={tableHeader}
            data={data}
            handleUpdateClick={handleUpdateClick}
            handleDelete={handleDelete}
            currentPage={currentPage}
            limit={limit}
          />
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              showIcons={true}
            />
          </div>
        </div>
        <DeleteConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this blood drive?"
        />
        {driveToUpdate && (
          <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Modal.Header>Update Blood Drive</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleUpdateBloodDrive}>
                <div className="space-y-4">
                  {/* Institute Input */}
                  <div>
                    <label
                      htmlFor="institute"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Institute
                    </label>
                    <input
                      type="text"
                      id="institute"
                      value={driveToUpdate.Institute}
                      onChange={(e) => handleChange(e, "Institute")}
                      placeholder="Institute"
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Province Dropdown */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Province Name
                    </label>
                    <select
                      id="location"
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={driveToUpdate.Location}
                      onChange={(e) => handleChange(e, "Location")}
                    >
                      {provinces.map((province) => (
                        <option key={province.ProvinceID} value={province.Name}>
                          {province.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation Input */}
                  <div>
                    <label
                      htmlFor="designation"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Designation
                    </label>
                    <input
                      type="text"
                      id="designation"
                      value={driveToUpdate.Designation}
                      onChange={(e) => handleChange(e, "Designation")}
                      placeholder="Designation"
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Scheduled Date Input */}
                  <div>
                    <label
                      htmlFor="scheduledDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Scheduled Date
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      value={driveToUpdate.ScheduledDate}
                      onChange={(e) => handleChange(e, "ScheduledDate")}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  >
                    Update Blood Drive
                  </button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
}
