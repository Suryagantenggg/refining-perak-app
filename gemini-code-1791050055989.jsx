import React, { useState, useEffect } from 'react';

// Data Awal Sampel dari PERAK.xlsx
const DEFAULT_CATEGORIES = [
  { code: 'A', name: 'Pentolan Kontaktor' },
  { code: 'B', name: 'Kontak Point' },
  { code: 'C', name: 'Ex Breaker' },
  { code: 'D', name: 'Mata Ikan (Ex Relay)' },
  { code: 'E', name: 'Mata Ikan (Ex Kontaktor)' },
  { code: 'F', name: 'Tembaga Plating Perak' },
  { code: 'G', name: 'Fuse' }
];

const DEFAULT_COLLECTORS = ['Andi', 'Budi', 'Cahyo'];
const DEFAULT_PROCESSORS = ['Zaenal', 'Eko', 'Fajar'];

const DEFAULT_TRANSACTIONS = [
  {
    id: 'TRX-001',
    kode: 1,
    tanggalAmbil: '2026-10-03',
    kategoriCode: 'A',
    kategoriName: 'Pentolan Kontaktor',
    pengambil: 'Andi',
    jumlahKotor: 499,
    hargaBeliSatuan: 22000,
    totalBeli: 10978000,
    biayaTransport: 50000,
    
    // Status Pengolahan
    status: 'TERJUAL', // 'MENUNGGU_OLAH' | 'SELESAI_OLAH' | 'TERJUAL'
    pengolah: 'Zaenal',
    biayaOlah: 50000,
    jumlahMurni: 384.23,
    efisiensi: 77.0,
    
    // Status Penjualan
    tanggalJual: '2026-10-04',
    jumlahJual: 384.23,
    hargaJualSatuan: 29000,
    tokoPembeli: 'Toko Emas Antam Jaya',
    lokasiPenjualan: 'Cikini, Jakarta Pusat',
    totalJual: 11142670,
    totalOperasional: 100000,
    totalUntung: 64670
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'pengambilan' | 'pengolahan' | 'penjualan' | 'dashboard' | 'pengaturan'
  const [searchTerm, setSearchTerm] = useState('');
  
  // States LocalStorage Sync
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('perak_transactions_v3');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [collectors, setCollectors] = useState(() => {
    const saved = localStorage.getItem('perak_collectors_v3');
    return saved ? JSON.parse(saved) : DEFAULT_COLLECTORS;
  });

  const [processors, setProcessors] = useState(() => {
    const saved = localStorage.getItem('perak_processors_v3');
    return saved ? JSON.parse(saved) : DEFAULT_PROCESSORS;
  });

  const [categories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    localStorage.setItem('perak_transactions_v3', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('perak_collectors_v3', JSON.stringify(collectors));
  }, [collectors]);

  useEffect(() => {
    localStorage.setItem('perak_processors_v3', JSON.stringify(processors));
  }, [processors]);

  // Form States
  // 1. Pengambilan
  const [formAmbil, setFormAmbil] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    pengambilSelect: collectors[0] || 'Andi',
    pengambilCustom: '',
    isCustomPengambil: false,
    kategoriCode: 'A',
    jumlahKotor: '',
    hargaBeliSatuan: '',
    biayaTransport: ''
  });

  // 2. Pengolahan
  const [formOlah, setFormOlah] = useState({
    trxId: '',
    pengolahSelect: processors[0] || 'Zaenal',
    pengolahCustom: '',
    isCustomPengolah: false,
    jumlahMurni: '',
    biayaOlah: ''
  });

  // 3. Penjualan (Diperbarui dengan Toko Pembeli & Lokasi)
  const [formJual, setFormJual] = useState({
    trxId: '',
    tanggalJual: new Date().toISOString().split('T')[0],
    hargaJualSatuan: '',
    jumlahJual: '',
    tokoPembeli: '',
    lokasiPenjualan: ''
  });

  // 4. Tim Setting
  const [newCollectorName, setNewCollectorName] = useState('');
  const [newProcessorName, setNewProcessorName] = useState('');

  // Helper Formatting
  const formatRupiah = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // HANDLER 1: Simpan Input Pengambilan
  const handleSavePengambilan = (e) => {
    e.preventDefault();
    const pengambilFinal = formAmbil.isCustomPengambil ? formAmbil.pengambilCustom.trim() : formAmbil.pengambilSelect;
    if (!pengambilFinal) return alert('Nama pengambil barang harus diisi!');

    const kotor = parseFloat(formAmbil.jumlahKotor) || 0;
    const hargaBeli = parseFloat(formAmbil.hargaBeliSatuan) || 0;
    const transport = parseFloat(formAmbil.biayaTransport) || 0;

    if (kotor <= 0 || hargaBeli <= 0) return alert('Jumlah barang kotor dan harga beli harus lebih dari 0!');

    const selectedCat = categories.find(c => c.code === formAmbil.kategoriCode);
    const newTrx = {
      id: `TRX-${String(transactions.length + 1).padStart(3, '0')}`,
      kode: transactions.length + 1,
      tanggalAmbil: formAmbil.tanggal,
      kategoriCode: selectedCat.code,
      kategoriName: selectedCat.name,
      pengambil: pengambilFinal,
      jumlahKotor: kotor,
      hargaBeliSatuan: hargaBeli,
      totalBeli: kotor * hargaBeli,
      biayaTransport: transport,
      status: 'MENUNGGU_OLAH',
      
      pengolah: '-',
      biayaOlah: 0,
      jumlahMurni: 0,
      efisiensi: 0,
      tanggalJual: '-',
      jumlahJual: 0,
      hargaJualSatuan: 0,
      tokoPembeli: '-',
      lokasiPenjualan: '-',
      totalJual: 0,
      totalOperasional: transport,
      totalUntung: 0
    };

    setTransactions([newTrx, ...transactions]);
    
    if (!collectors.includes(pengambilFinal)) {
      setCollectors([...collectors, pengambilFinal]);
    }

    alert(`Transaksi ${newTrx.id} berhasil ditambahkan! Status: MENUNGGU OLAH`);
    setFormAmbil({
      ...formAmbil,
      jumlahKotor: '',
      hargaBeliSatuan: '',
      biayaTransport: '',
      pengambilCustom: '',
      isCustomPengambil: false
    });
    setActiveTab('pengolahan');
  };

  // HANDLER 2: Simpan Input Pengolahan
  const handleSavePengolahan = (e) => {
    e.preventDefault();
    if (!formOlah.trxId) return alert('Pilih transaksi yang akan diolah!');
    
    const pengolahFinal = formOlah.isCustomPengolah ? formOlah.pengolahCustom.trim() : formOlah.pengolahSelect;
    if (!pengolahFinal) return alert('Nama pengolah harus diisi!');

    const murni = parseFloat(formOlah.jumlahMurni) || 0;
    const olah = parseFloat(formOlah.biayaOlah) || 0;

    if (murni <= 0) return alert('Jumlah hasil perak murni harus lebih dari 0!');

    setTransactions(transactions.map(t => {
      if (t.id === formOlah.trxId) {
        const efisiensi = (murni / t.jumlahKotor) * 100;
        const totalOps = (t.biayaTransport || 0) + olah;
        return {
          ...t,
          status: 'SELESAI_OLAH',
          pengolah: pengolahFinal,
          jumlahMurni: murni,
          biayaOlah: olah,
          efisiensi: parseFloat(efisiensi.toFixed(2)),
          jumlahJual: murni,
          totalOperasional: totalOps
        };
      }
      return t;
    }));

    if (!processors.includes(pengolahFinal)) {
      setProcessors([...processors, pengolahFinal]);
    }

    alert(`Pemurnian transaksi ${formOlah.trxId} selesai! Status: SELESAI OLAH`);
    setFormOlah({
      trxId: '',
      pengolahSelect: processors[0] || '',
      pengolahCustom: '',
      isCustomPengolah: false,
      jumlahMurni: '',
      biayaOlah: ''
    });
    setActiveTab('penjualan');
  };

  // HANDLER 3: Simpan Input Penjualan (Memproses Keterangan Tujuan & Daerah Jual)
  const handleSavePenjualan = (e) => {
    e.preventDefault();
    if (!formJual.trxId) return alert('Pilih transaksi yang akan dijual!');

    const hargaJual = parseFloat(formJual.hargaJualSatuan) || 0;
    const jmlJual = parseFloat(formJual.jumlahJual) || 0;

    if (hargaJual <= 0 || jmlJual <= 0) return alert('Harga jual dan jumlah gram harus lebih dari 0!');
    if (!formJual.tokoPembeli.trim()) return alert('Nama Toko / Pembeli Tujuan harus diisi!');
    if (!formJual.lokasiPenjualan.trim()) return alert('Daerah / Wilayah Lokasi Penjualan harus diisi!');

    setTransactions(transactions.map(t => {
      if (t.id === formJual.trxId) {
        const totalJual = jmlJual * hargaJual;
        const totalUntung = totalJual - t.totalBeli - t.totalOperasional;
        return {
          ...t,
          status: 'TERJUAL',
          tanggalJual: formJual.tanggalJual,
          hargaJualSatuan: hargaJual,
          jumlahJual: jmlJual,
          tokoPembeli: formJual.tokoPembeli.trim(),
          lokasiPenjualan: formJual.lokasiPenjualan.trim(),
          totalJual: totalJual,
          totalUntung: totalUntung
        };
      }
      return t;
    }));

    alert(`Penjualan transaksi ${formJual.trxId} berhasil! Ditujukan ke ${formJual.tokoPembeli} (${formJual.lokasiPenjualan}).`);
    setFormJual({
      trxId: '',
      tanggalJual: new Date().toISOString().split('T')[0],
      hargaJualSatuan: '',
      jumlahJual: '',
      tokoPembeli: '',
      lokasiPenjualan: ''
    });
    setActiveTab('dashboard');
  };

  // Hapus Transaksi
  const handleDeleteTrx = (id) => {
    if (window.confirm(`Yakin ingin menghapus transaksi ${id}?`)) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Reset Data Sampel
  const handleResetData = () => {
    if (window.confirm('Kembalikan data ke awal? Semua data lokal akan direset.')) {
      setTransactions(DEFAULT_TRANSACTIONS);
      setCollectors(DEFAULT_COLLECTORS);
      setProcessors(DEFAULT_PROCESSORS);
      localStorage.clear();
    }
  };

  // Filter Transaksi untuk Form Selection
  const pendingOlahList = transactions.filter(t => t.status === 'MENUNGGU_OLAH');
  const pendingJualList = transactions.filter(t => t.status === 'SELESAI_OLAH');

  // Filter Search pada Laporan
  const filteredTransactions = transactions.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.kategoriName.toLowerCase().includes(term) ||
      t.pengambil.toLowerCase().includes(term) ||
      (t.pengolah && t.pengolah.toLowerCase().includes(term)) ||
      (t.tokoPembeli && t.tokoPembeli.toLowerCase().includes(term)) ||
      (t.lokasiPenjualan && t.lokasiPenjualan.toLowerCase().includes(term))
    );
  });

  // Stats Dashboard
  const totalBarangKotor = transactions.reduce((acc, t) => acc + (t.jumlahKotor || 0), 0);
  const totalPerakMurni = transactions.reduce((acc, t) => acc + (t.jumlahMurni || 0), 0);
  const totalBeliModal = transactions.reduce((acc, t) => acc + (t.totalBeli || 0), 0);
  const totalBiayaOperasional = transactions.reduce((acc, t) => acc + (t.totalOperasional || 0), 0);
  const totalOmsetPenjualan = transactions.filter(t => t.status === 'TERJUAL').reduce((acc, t) => acc + (t.totalJual || 0), 0);
  const totalLabaBersih = transactions.filter(t => t.status === 'TERJUAL').reduce((acc, t) => acc + (t.totalUntung || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-black text-xl">Ag</div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Refining Perak System</h1>
              <p className="text-xs text-slate-400">Pengadaan, Pemurnian, & Penjualan Perak</p>
            </div>
          </div>

          <button 
            onClick={handleResetData}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition"
          >
            🔄 Reset Data Sampel
          </button>
        </div>

        {/* NAVIGATION TAB BAR */}
        <nav className="bg-slate-800 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('pengambilan')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                activeTab === 'pengambilan' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              📥 1. Input Pengambilan
            </button>
            <button
              onClick={() => setActiveTab('pengolahan')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 relative ${
                activeTab === 'pengolahan' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              🧪 2. Input Pengolahan
              {pendingOlahList.length > 0 && (
                <span className="bg-amber-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingOlahList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('penjualan')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 relative ${
                activeTab === 'penjualan' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              💰 3. Input Penjualan
              {pendingJualList.length > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingJualList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              📊 Laporan & Transaksi
            </button>
            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                activeTab === 'pengaturan' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              ⚙️ Pengaturan Tim
            </button>
          </div>
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ================= TAB 1: INPUT PENGAMBILAN ================= */}
        {activeTab === 'pengambilan' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                📥 Input Pengambilan Barang Mentah
              </h2>
              <p className="text-xs text-slate-400 mt-1">Formulir khusus tim lapangan untuk menginput pembelian barang kotor & biaya transport.</p>
            </div>

            <form onSubmit={handleSavePengambilan} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Pengambilan</label>
                  <input
                    type="date"
                    required
                    value={formAmbil.tanggal}
                    onChange={(e) => setFormAmbil({ ...formAmbil, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Nama Pengambil Barang</label>
                    <button
                      type="button"
                      onClick={() => setFormAmbil({ ...formAmbil, isCustomPengambil: !formAmbil.isCustomPengambil })}
                      className="text-[11px] text-amber-600 hover:underline font-semibold"
                    >
                      {formAmbil.isCustomPengambil ? "← Pilih dari Daftar" : "+ Ketik Nama Baru"}
                    </button>
                  </div>

                  {!formAmbil.isCustomPengambil ? (
                    <select
                      value={formAmbil.pengambilSelect}
                      onChange={(e) => setFormAmbil({ ...formAmbil, pengambilSelect: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {collectors.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Masukkan nama pengambil baru..."
                      required
                      value={formAmbil.pengambilCustom}
                      onChange={(e) => setFormAmbil({ ...formAmbil, pengambilCustom: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Barang</label>
                <select
                  value={formAmbil.kategoriCode}
                  onChange={(e) => setFormAmbil({ ...formAmbil, kategoriCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Barang Kotor (Gram)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="misal: 499"
                    required
                    value={formAmbil.jumlahKotor}
                    onChange={(e) => setFormAmbil({ ...formAmbil, jumlahKotor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Beli / Gram (Rp)</label>
                  <input
                    type="number"
                    placeholder="misal: 22000"
                    required
                    value={formAmbil.hargaBeliSatuan}
                    onChange={(e) => setFormAmbil({ ...formAmbil, hargaBeliSatuan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Biaya Transportasi (Rp)</label>
                <input
                  type="number"
                  placeholder="misal: 50000"
                  value={formAmbil.biayaTransport}
                  onChange={(e) => setFormAmbil({ ...formAmbil, biayaTransport: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-900">Total Beli (Estimasi Modal):</span>
                  <span className="text-lg font-black text-amber-700">
                    {formatRupiah((parseFloat(formAmbil.jumlahKotor) || 0) * (parseFloat(formAmbil.hargaBeliSatuan) || 0))}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg shadow transition"
              >
                Simpan & Teruskan ke Pengolah ➔
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 2: INPUT PENGOLAHAN ================= */}
        {activeTab === 'pengolahan' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                🧪 Input Pengolahan & Pemurnian Perak
              </h2>
              <p className="text-xs text-slate-400 mt-1">Formulir khusus tim pemurnian untuk menginput biaya olah & hasil perak murni.</p>
            </div>

            {pendingOlahList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-semibold text-sm">Tidak ada antrean barang kotor untuk diolah.</p>
                <p className="text-xs mt-1 text-slate-400">Silakan input pengambilan barang baru terlebih dahulu.</p>
              </div>
            ) : (
              <form onSubmit={handleSavePengolahan} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Transaksi Barang Masuk</label>
                  <select
                    required
                    value={formOlah.trxId}
                    onChange={(e) => {
                      const selected = transactions.find(t => t.id === e.target.value);
                      setFormOlah({
                        ...formOlah,
                        trxId: e.target.value,
                        jumlahMurni: selected ? selected.jumlahMurni || '' : ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">-- Pilih Antrean Transaksi --</option>
                    {pendingOlahList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} | {t.kategoriName} | Kotor: {t.jumlahKotor}g | Pengambil: {t.pengambil}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Nama Pengolah Perak</label>
                    <button
                      type="button"
                      onClick={() => setFormOlah({ ...formOlah, isCustomPengolah: !formOlah.isCustomPengolah })}
                      className="text-[11px] text-amber-600 hover:underline font-semibold"
                    >
                      {formOlah.isCustomPengolah ? "← Pilih dari Daftar" : "+ Ketik Nama Baru"}
                    </button>
                  </div>

                  {!formOlah.isCustomPengolah ? (
                    <select
                      value={formOlah.pengolahSelect}
                      onChange={(e) => setFormOlah({ ...formOlah, pengolahSelect: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {processors.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Masukkan nama pengolah baru..."
                      required
                      value={formOlah.pengolahCustom}
                      onChange={(e) => setFormOlah({ ...formOlah, pengolahCustom: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Hasil Perak Murni (Gram)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="misal: 384.23"
                      required
                      value={formOlah.jumlahMurni}
                      onChange={(e) => setFormOlah({ ...formOlah, jumlahMurni: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Biaya Pengolahan (Rp)</label>
                    <input
                      type="number"
                      placeholder="misal: 50000"
                      value={formOlah.biayaOlah}
                      onChange={(e) => setFormOlah({ ...formOlah, biayaOlah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                {formOlah.trxId && formOlah.jumlahMurni && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                    {(() => {
                      const selectedTrx = transactions.find(t => t.id === formOlah.trxId);
                      if (!selectedTrx) return null;
                      const efisiensi = ((parseFloat(formOlah.jumlahMurni) / selectedTrx.jumlahKotor) * 100).toFixed(2);
                      return (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-blue-800">Rendemen Efisiensi Pemurnian:</p>
                            <p className="text-[11px] text-blue-600">
                              ({formOlah.jumlahMurni}g murni / {selectedTrx.jumlahKotor}g kotor)
                            </p>
                          </div>
                          <span className="text-2xl font-black text-blue-700">{efisiensi}%</span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition"
                >
                  Simpan Pemurnian & Siapkan Penjualan ➔
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 3: INPUT PENJUALAN (DENGAN DETAIL TUJUAN & LOKASI) ================= */}
        {activeTab === 'penjualan' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                💰 Input Penjualan Perak Murni
              </h2>
              <p className="text-xs text-slate-400 mt-1">Formulir khusus admin untuk menginput harga jual, lokasi tujuan, & menyelesaikan transaksi.</p>
            </div>

            {pendingJualList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">📦</div>
                <p className="font-semibold text-sm">Tidak ada stok perak murni yang siap dijual.</p>
                <p className="text-xs mt-1 text-slate-400">Silakan selesaikan proses pemurnian terlebih dahulu.</p>
              </div>
            ) : (
              <form onSubmit={handleSavePenjualan} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Transaksi Perak Murni Siap Jual</label>
                  <select
                    required
                    value={formJual.trxId}
                    onChange={(e) => {
                      const selected = transactions.find(t => t.id === e.target.value);
                      setFormJual({
                        ...formJual,
                        trxId: e.target.value,
                        jumlahJual: selected ? selected.jumlahMurni : ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">-- Pilih Perak Siap Jual --</option>
                    {pendingJualList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} | {t.kategoriName} | Perak Murni: {t.jumlahMurni}g
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Penjualan</label>
                    <input
                      type="date"
                      required
                      value={formJual.tanggalJual}
                      onChange={(e) => setFormJual({ ...formJual, tanggalJual: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Gram Dijual</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="misal: 384.23"
                      required
                      value={formJual.jumlahJual}
                      onChange={(e) => setFormJual({ ...formJual, jumlahJual: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Jual / Gram (Rp)</label>
                  <input
                    type="number"
                    placeholder="misal: 29000"
                    required
                    value={formJual.hargaJualSatuan}
                    onChange={(e) => setFormJual({ ...formJual, hargaJualSatuan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* KHUSUS: KETERANGAN TUJUAN DAN DAERAH PENJUALAN */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    📍 Keterangan Penjualan (Kemana & Daerah Mana)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Dijual Kemana (Toko / Pembeli)</label>
                      <input
                        type="text"
                        placeholder="e.g. Toko Emas Antam Jaya / Pak Hendra"
                        required
                        value={formJual.tokoPembeli}
                        onChange={(e) => setFormJual({ ...formJual, tokoPembeli: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Daerah / Wilayah Penjualan</label>
                      <input
                        type="text"
                        placeholder="e.g. Cikini, Jakarta Pusat / Bandung"
                        required
                        value={formJual.lokasiPenjualan}
                        onChange={(e) => setFormJual({ ...formJual, lokasiPenjualan: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* SIMULASI LABA BERSIH */}
                {formJual.trxId && formJual.hargaJualSatuan && (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-4 space-y-2">
                    {(() => {
                      const t = transactions.find(x => x.id === formJual.trxId);
                      if (!t) return null;
                      const totalJual = (parseFloat(formJual.jumlahJual) || 0) * (parseFloat(formJual.hargaJualSatuan) || 0);
                      const netProfit = totalJual - t.totalBeli - t.totalOperasional;
                      return (
                        <>
                          <div className="flex justify-between text-xs text-emerald-800">
                            <span>Total Penjualan (Omset):</span>
                            <span className="font-bold">{formatRupiah(totalJual)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Modal Beli + Total Operasional:</span>
                            <span>- {formatRupiah(t.totalBeli + t.totalOperasional)}</span>
                          </div>
                          <hr className="border-emerald-200" />
                          <div className="flex justify-between items-center text-emerald-900 font-bold">
                            <span>Estimasi Laba Bersih (Net Profit):</span>
                            <span className="text-xl text-emerald-700">{formatRupiah(netProfit)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow transition"
                >
                  Selesaikan Penjualan & Hitung Untung ➔
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 4: DASHBOARD & REKAP LAPORAN ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Barang Mentah</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{totalBarangKotor.toFixed(2)} <span className="text-sm font-normal">Gram</span></p>
                <span className="text-xs text-slate-500 mt-1 block">Modal Beli: {formatRupiah(totalBeliModal)}</span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hasil Perak Murni</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{totalPerakMurni.toFixed(2)} <span className="text-sm font-normal">Gram</span></p>
                <span className="text-xs text-slate-500 mt-1 block">Biaya Ops: {formatRupiah(totalBiayaOperasional)}</span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Omset Penjualan</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatRupiah(totalOmsetPenjualan)}</p>
                <span className="text-xs text-emerald-600 mt-1 block">Dari transaksi terjual</span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Laba Bersih</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{formatRupiah(totalLabaBersih)}</p>
                <span className="text-xs text-amber-600 mt-1 block">Net Profit terakumulasi</span>
              </div>
            </div>

            {/* TABEL TRANSAKSI LENGKAP */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">Daftar Semua Transaksi & Laporan Penjualan</h3>
                  <p className="text-xs text-slate-500">Mencakup alur Pengambilan, Pemurnian, Penjualan & Lokasi Tujuan.</p>
                </div>

                <div className="w-full md:w-72">
                  <input
                    type="text"
                    placeholder="🔍 Cari kode, pembeli, lokasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-3 py-3">Kode</th>
                      <th className="px-3 py-3">Tanggal</th>
                      <th className="px-3 py-3">Kategori</th>
                      <th className="px-3 py-3">Pengambil</th>
                      <th className="px-3 py-3 text-right">Kotor (g)</th>
                      <th className="px-3 py-3 text-right">Total Beli</th>
                      <th className="px-3 py-3">Pengolah</th>
                      <th className="px-3 py-3 text-right">Murni (g)</th>
                      <th className="px-3 py-3 text-center">Rendemen</th>
                      <th className="px-3 py-3">Dijual Kemana & Daerah</th>
                      <th className="px-3 py-3 text-right">Total Jual</th>
                      <th className="px-3 py-3 text-right">Untung Bersih</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="px-3 py-3 font-bold text-slate-700">{t.id}</td>
                        <td className="px-3 py-3">{t.tanggalAmbil}</td>
                        <td className="px-3 py-3 font-semibold text-slate-600">[{t.kategoriCode}] {t.kategoriName}</td>
                        <td className="px-3 py-3 font-medium text-slate-800">{t.pengambil}</td>
                        <td className="px-3 py-3 text-right font-mono">{t.jumlahKotor}</td>
                        <td className="px-3 py-3 text-right font-mono">{formatRupiah(t.totalBeli)}</td>
                        <td className="px-3 py-3">{t.pengolah || '-'}</td>
                        <td className="px-3 py-3 text-right font-mono">{t.jumlahMurni || '-'}</td>
                        <td className="px-3 py-3 text-center font-bold text-blue-600">
                          {t.efisiensi ? `${t.efisiensi}%` : '-'}
                        </td>
                        <td className="px-3 py-3">
                          {t.tokoPembeli && t.tokoPembeli !== '-' ? (
                            <div>
                              <p className="font-semibold text-slate-800">{t.tokoPembeli}</p>
                              <p className="text-[10px] text-slate-500">📍 {t.lokasiPenjualan || '-'}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-600">
                          {t.totalJual ? formatRupiah(t.totalJual) : '-'}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-amber-600">
                          {t.totalUntung ? formatRupiah(t.totalUntung) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'TERJUAL' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'SELESAI_OLAH' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleDeleteTrx(t.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs"
                            title="Hapus Transaksi"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PENGATURAN TIM & MASTER DATA ================= */}
        {activeTab === 'pengaturan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* TIM PENGAMBIL */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                👥 Kelola Tim Pengambil Barang
              </h3>
              <p className="text-xs text-slate-500 mb-4">Daftar nama yang muncul di dropdown pilihan pengambil barang.</p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Tambah nama pengambil..."
                  value={newCollectorName}
                  onChange={(e) => setNewCollectorName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => {
                    if (newCollectorName.trim() && !collectors.includes(newCollectorName.trim())) {
                      setCollectors([...collectors, newCollectorName.trim()]);
                      setNewCollectorName('');
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  + Tambah
                </button>
              </div>

              <ul className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
                {collectors.map((name, index) => (
                  <li key={index} className="px-4 py-2.5 flex justify-between items-center text-sm">
                    <span>{name}</span>
                    <button
                      onClick={() => setCollectors(collectors.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* TIM PENGOLAH */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                🔬 Kelola Tim Pengolah Perak
              </h3>
              <p className="text-xs text-slate-500 mb-4">Daftar nama yang muncul di dropdown pilihan pengolah perak.</p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Tambah nama pengolah..."
                  value={newProcessorName}
                  onChange={(e) => setNewProcessorName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newProcessorName.trim() && !processors.includes(newProcessorName.trim())) {
                      setProcessors([...processors, newProcessorName.trim()]);
                      setNewProcessorName('');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  + Tambah
                </button>
              </div>

              <ul className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
                {processors.map((name, index) => (
                  <li key={index} className="px-4 py-2.5 flex justify-between items-center text-sm">
                    <span>{name}</span>
                    <button
                      onClick={() => setProcessors(processors.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}