/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import getStyleForStatus from "../../utils/get-style-status";

function DisplayTableComponent({
  tableHeader,
  data,
  handleUpdateClick,
  handleDelete,
  currentPage,
  limit,
}) {
  const renderTableCell = (item, header) => {
    const content = item[header];
    if (content && typeof content === "object") {
      return content.Name || "N/A";
    }
    return content || "N/A";
  };

  const renderTableRows = (data) => {
    return data.map((item, index) => (
      <tr
        key={
          item.RequestID ||
          item.AppointmentID ||
          item.DriveID ||
          item.OfferID ||
          item.DonationID ||
          item.UserID ||
          index
        }
        className="border-b"
      >
        <td className="py-2 px-4">
          {(currentPage ? currentPage - 1 : 0) * (limit || 10) + index + 1}
        </td>

        {tableHeader.slice(1).map((header) => (
          <td
            key={header}
            className={`py-2 px-4 ${getStyleForStatus(item[header])}`}
          >
            {renderTableCell(item, header)}
          </td>
        ))}
        <td className="py-2 px-4">
          <button
            onClick={() => handleUpdateClick(item)}
            className="bg-blue text-white px-2 py-1 rounded-md hover:bg-blue-700"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </td>
        <td className="py-2 px-4">
          <button
            onClick={() => handleDelete(item)}
            className="bg-red text-white px-2 py-1 rounded-md hover:bg-red-700"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="overflow-x-scroll">
      <table className="mt-10 shadow-lg bg-white w-full">
        <thead className="bg-dark p-4 text-off_white font-normal border border-dark">
          <tr>
            {tableHeader.map((header, index) => (
              <th
                className="px-4 py-4 font-normal text-[14px] text-start uppercase tracking-[.3em] border-rmd"
                key={index}
              >
                {header}
              </th>
            ))}
            <th className="px-4 py-4 cols" colSpan={2}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="border-b border-off_white">
          {renderTableRows(data)}
        </tbody>
      </table>
    </div>
  );
}

DisplayTableComponent.propTypes = {
  tableHeader: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  handleUpdateClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

export default DisplayTableComponent;
