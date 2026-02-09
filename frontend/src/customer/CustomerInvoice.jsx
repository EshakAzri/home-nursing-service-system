import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Check, Clock, XCircle, DollarSign, Calendar, User, MapPin, FileText } from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerInvoice.css';

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!invoice || !booking) return;

    const invoiceText = generateInvoiceText();
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateInvoiceText = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const bookingDate = formatter.format(new Date(booking.bookingDateTime));
    const issuedDate = formatter.format(new Date(invoice.issuedDate));
    const dueDate = formatter.format(new Date(invoice.dueDate));
    const invoiceType = booking.status?.toLowerCase() === 'completed' ? 'FINAL INVOICE' : 'ESTIMATED INVOICE';

    return `
================================================================================
                           HOME NURSING SERVICE
                              ${invoiceType}
================================================================================

Invoice Number: ${invoice.invoiceNumber}
Issued Date: ${issuedDate}
Due Date: ${dueDate}

--------------------------------------------------------------------------------
BILL TO:
--------------------------------------------------------------------------------
Customer Name: ${booking.user?.username || 'N/A'}
Email: ${booking.user?.email || 'N/A'}
Address: ${booking.user?.address || 'N/A'}

--------------------------------------------------------------------------------
SERVICE DETAILS:
--------------------------------------------------------------------------------
Service Type: ${booking.serviceType?.name || 'N/A'}
Service Date: ${bookingDate}
Duration: ${booking.duration || booking.serviceType?.estimatedDurationHours || 'N/A'} hours
Assigned Nurse: ${booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'Not assigned yet'}
Status: ${booking.status || 'N/A'}

Service Description:
${booking.serviceType?.description || 'N/A'}

${booking.notes ? `Additional Notes:\n${booking.notes}` : ''}

--------------------------------------------------------------------------------
COST BREAKDOWN:
--------------------------------------------------------------------------------
Service Duration: ${booking.duration || booking.serviceType?.estimatedDurationHours || 0} hours
Rate per Hour: $${booking.serviceType?.basePricePerHour || 0}
${booking.finalCost ? `Base Amount: $${booking.estimatedCost || 0}` : ''}
${booking.finalCost ? `Adjustments: $${(booking.finalCost - booking.estimatedCost).toFixed(2)}` : ''}

                                                    TOTAL: $${invoice.amount.toFixed(2)}

--------------------------------------------------------------------------------
PAYMENT INFORMATION:
--------------------------------------------------------------------------------
Invoice Status: ${invoice.status}
${invoice.status === 'PAID' ? `Payment Date: ${formatter.format(new Date())}` : `Payment Due: ${dueDate}`}

--------------------------------------------------------------------------------
TERMS & CONDITIONS:
--------------------------------------------------------------------------------
1. Payment is due within 30 days of invoice date.
2. Late payments may incur additional charges.
3. For payment inquiries, please contact our billing department.
4. All services are provided by licensed healthcare professionals.

================================================================================
                     Thank you for choosing Home Nursing Service!
                          For inquiries: support@homenursing.com
                                   Phone: 1-800-NURSING
================================================================================
`;
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

  const invoiceType = booking.status?.toLowerCase() === 'completed' ? 'FINAL INVOICE' : 'ESTIMATED INVOICE';

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
              Download
            </button>
            <button onClick={handlePrint} className="btn-action btn-print">
              <Printer size={18} />
              Print
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
                  <td>${booking.serviceType?.basePricePerHour || 0}/hour</td>
                  <td>${booking.estimatedCost?.toFixed(2) || '0.00'}</td>
                </tr>
                {booking.finalCost && booking.finalCost !== booking.estimatedCost && (
                  <tr>
                    <td>Adjustments</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${(booking.finalCost - booking.estimatedCost).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="total-section">
              <div className="total-row">
                <span className="total-label">Total Amount:</span>
                <span className="total-amount">${invoice.amount.toFixed(2)}</span>
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
