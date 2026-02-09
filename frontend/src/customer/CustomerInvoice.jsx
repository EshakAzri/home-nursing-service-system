import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Check, Clock, XCircle, DollarSign, Calendar, User, MapPin, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import CustomerSidebar from './CustomerSidebar';
import './CustomerInvoice.css';

const FUEL_COST = 10.00; // Fixed fuel charge in RM

const CustomerInvoice = () => {
  const [invoice, setInvoice] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [bookingId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Try to fetch existing invoice
      let invoiceData = null;
      try {
        const invoiceResponse = await axios.get(
          `http://localhost:8080/api/invoices/booking/${bookingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        invoiceData = invoiceResponse.data;
      } catch (err) {
        if (err.response?.status === 404) {
          // No invoice exists, generate one
          const generateResponse = await axios.post(
            `http://localhost:8080/api/invoices/generate/${bookingId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          invoiceData = generateResponse.data;
        } else {
          throw err;
        }
      }

      setInvoice(invoiceData);
      setBooking(invoiceData.booking);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view this invoice.');
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to load invoice. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const invoiceEl = document.querySelector('.invoice-document');
    if (!invoiceEl) return;

    try {
      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Scale to fit 1 page if content is taller than page
      let imgX, imgY, finalWidth, finalHeight;
      if (imgHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
        imgX = (pdfWidth - finalWidth) / 2;
        imgY = 10;
      } else {
        finalWidth = imgWidth;
        finalHeight = imgHeight;
        imgX = 10;
        imgY = 10;
      }

      // Draw border around the invoice
      pdf.setDrawColor(0, 123, 255); // Blue border
      pdf.setLineWidth(0.5);
      pdf.rect(imgX - 2, imgY - 2, finalWidth + 4, finalHeight + 4);

      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);

      pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Check className="status-icon status-paid" />;
      case 'pending':
        return <Clock className="status-icon status-pending" />;
      case 'cancelled':
        return <XCircle className="status-icon status-cancelled" />;
      default:
        return <Clock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-badge-paid';
      case 'pending':
        return 'status-badge-pending';
      case 'cancelled':
        return 'status-badge-cancelled';
      default:
        return 'status-badge-pending';
    }
  };

  if (loading) {
    return (
      <div className="customer-invoice-container">
        <CustomerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onLogout={handleLogout} />
        <div className={`invoice-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-invoice-container">
        <CustomerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onLogout={handleLogout} />
        <div className={`invoice-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="error-container">
            <XCircle className="error-icon" />
            <h2>Error Loading Invoice</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/customer/booking-history')} className="btn-back">
              <ArrowLeft size={18} />
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice || !booking) {
    return null;
  }

  const invoiceType = booking.status?.toLowerCase() === 'completed' ? 'FINAL INVOICE' : 'INVOICE';

  return (
    <div className="customer-invoice-container">
      <CustomerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onLogout={handleLogout} />
      <div className={`invoice-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Action Bar - Not printed */}
        <div className="invoice-action-bar no-print">
          <button onClick={() => navigate('/customer/booking-history')} className="btn-back-header">
            <ArrowLeft size={18} />
            Back to Bookings
          </button>
          <div className="invoice-actions">
            <button onClick={handleDownload} className="btn-action btn-download">
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="invoice-document">
          {/* Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1>Home Nursing Service</h1>
              <p>Professional Healthcare at Your Doorstep</p>
            </div>
            <div className="invoice-title">
              <h2>{invoiceType}</h2>
              <div className={`status-badge ${getStatusClass(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="invoice-info-section">
            <div className="invoice-meta">
              <div className="meta-item">
                <FileText size={18} />
                <div>
                  <span className="meta-label">Invoice Number</span>
                  <span className="meta-value">{invoice.invoiceNumber}</span>
                </div>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <div>
                  <span className="meta-label">Issued Date</span>
                  <span className="meta-value">{formatDate(invoice.issuedDate)}</span>
                </div>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <div>
                  <span className="meta-label">Due Date</span>
                  <span className="meta-value">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Service Info */}
          <div className="invoice-parties">
            <div className="party-section">
              <h3>Bill To</h3>
              <div className="party-details">
                <div className="detail-row">
                  <User size={16} />
                  <span>{booking.user?.username || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">@</span>
                  <span>{booking.user?.email || 'N/A'}</span>
                </div>
                {booking.user?.address && (
                  <div className="detail-row">
                    <MapPin size={16} />
                    <span>{booking.user.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="party-section">
              <h3>Service Information</h3>
              <div className="party-details">
                <div className="detail-row">
                  <span className="detail-label">Service Type:</span>
                  <span className="detail-value">{booking.serviceType?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Service Date:</span>
                  <span className="detail-value">{formatDateTime(booking.bookingDateTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{booking.duration || booking.serviceType?.estimatedDurationHours || 'N/A'} hours</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Assigned Nurse:</span>
                  <span className="detail-value">
                    {booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'Not assigned yet'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booking Status:</span>
                  <span className={`status-badge-small ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Description */}
          {booking.serviceType?.description && (
            <div className="service-description">
              <h3>Service Description</h3>
              <p>{booking.serviceType.description}</p>
            </div>
          )}

          {/* Additional Notes */}
          {booking.notes && (
            <div className="service-notes">
              <h3>Additional Notes</h3>
              <p>{booking.notes}</p>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="cost-breakdown">
            <h3>Cost Breakdown</h3>
            <table className="cost-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{booking.serviceType?.name || 'Nursing Service'}</td>
                  <td>{booking.duration || booking.serviceType?.estimatedDurationHours || 0} hours</td>
                  <td>RM{(booking.serviceFee || booking.serviceType?.basePricePerHour || 0).toFixed(2)}/hour</td>
                  <td>RM{((booking.serviceFee || booking.serviceType?.basePricePerHour || 0) * (booking.duration || 0)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Nurse Service</td>
                  <td>{booking.duration || 0} hours</td>
                  <td>RM{(booking.nurseRate || booking.nurse?.hourlyRate || 0).toFixed(2)}/hour</td>
                  <td>RM{((booking.nurseRate || booking.nurse?.hourlyRate || 0) * (booking.duration || 0)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Fuel Charge</td>
                  <td>-</td>
                  <td>Fixed</td>
                  <td>RM{(booking.fuelCost || FUEL_COST).toFixed(2)}</td>
                </tr>
                {booking.finalCost && booking.finalCost !== booking.estimatedCost && (
                  <tr>
                    <td>Adjustments</td>
                    <td>-</td>
                    <td>-</td>
                    <td>RM{(booking.finalCost - booking.estimatedCost).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="total-section">
              <div className="total-row">
                <span className="total-label">Total Amount:</span>
                <span className="total-amount">RM{invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="payment-info">
            <h3>Payment Information</h3>
            <div className="payment-details">
              <div className="payment-row">
                <span className="payment-label">Status:</span>
                <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status}
                </span>
              </div>
              {invoice.status === 'PAID' ? (
                <div className="payment-row">
                  <span className="payment-label">Payment Date:</span>
                  <span className="payment-value">{formatDate(new Date())}</span>
                </div>
              ) : (
                <div className="payment-row">
                  <span className="payment-label">Payment Due:</span>
                  <span className="payment-value">{formatDate(invoice.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="terms-section">
            <h3>Terms & Conditions</h3>
            <ol>
              <li>Payment is due within 30 days of invoice date.</li>
              <li>Late payments may incur additional charges.</li>
              <li>For payment inquiries, please contact our billing department.</li>
              <li>All services are provided by licensed healthcare professionals.</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p className="footer-thanks">Thank you for choosing Home Nursing Service!</p>
            <div className="footer-contact">
              <p>For inquiries: support@homenursing.com | Phone: 1-800-NURSING</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoice;
