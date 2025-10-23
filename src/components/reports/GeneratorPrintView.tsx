import { format } from 'date-fns';
import { GeneratorLog } from '@/types/generator';
import logo from '@/assets/logo.png';

interface GeneratorPrintViewProps {
  log: GeneratorLog;
}

export function GeneratorPrintView({ log }: GeneratorPrintViewProps) {
  const DataRow = ({ label, value, unit }: { label: string; value?: number | null; unit?: string }) => (
    <tr className="border-b">
      <td className="py-2 px-4 font-medium">{label}</td>
      <td className="py-2 px-4">
        {value !== null && value !== undefined ? `${value}${unit ? ` ${unit}` : ''}` : '-'}
      </td>
    </tr>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-lg font-bold mt-6 mb-3 pb-2 border-b-2 border-gray-300">{title}</h3>
  );

  return (
    <div className="bg-white p-8 print:p-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-blue-600 relative">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="absolute top-0 right-0 w-20 h-20 object-contain"
        />
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          GAYATRI POWER PRIVATE LIMITED
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">GENERATOR LOG SHEET</h2>
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <span className="font-medium">Date:</span> {format(new Date(log.date), 'dd-MM-yyyy')}
          </div>
          <div>
            <span className="font-medium">Hour:</span> {log.hour.toString().padStart(2, '0')}:00
          </div>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span className={log.finalized ? 'text-green-600' : 'text-blue-600'}>
              {log.finalized ? 'Finalized' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Generator Winding Temperatures */}
      <SectionTitle title="1. GENERATOR WINDING TEMPERATURES" />
      <table className="w-full mb-4 border">
        <tbody>
          <DataRow label="R1 (Red Phase Winding 1)" value={log.winding_temp_r1} unit="°C" />
          <DataRow label="R2 (Red Phase Winding 2)" value={log.winding_temp_r2} unit="°C" />
          <DataRow label="Y1 (Yellow Phase Winding 1)" value={log.winding_temp_y1} unit="°C" />
          <DataRow label="Y2 (Yellow Phase Winding 2)" value={log.winding_temp_y2} unit="°C" />
          <DataRow label="B1 (Blue Phase Winding 1)" value={log.winding_temp_b1} unit="°C" />
          <DataRow label="B2 (Blue Phase Winding 2)" value={log.winding_temp_b2} unit="°C" />
        </tbody>
      </table>

      {/* Section 2: Bearing Temperatures */}
      <SectionTitle title="2. BEARING TEMPERATURES" />
      <table className="w-full mb-4 border">
        <tbody>
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Generator Drive End (G.DE)
            </td>
          </tr>
          <DataRow label="G.DE BRG MAIN (CH7)" value={log.bearing_g_de_brg_main_ch7} unit="°C" />
          <DataRow label="G.NDE BRG STAND (CH8)" value={log.bearing_g_nde_brg_stand_ch8} unit="°C" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Gear Shaft
            </td>
          </tr>
          <DataRow label="THRUST -1 (CH9)" value={log.bearing_thrust_1_ch9} unit="°C" />
          <DataRow label="THRUST -2 (CH10)" value={log.bearing_thrust_2_ch10} unit="°C" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Driven Shaft
            </td>
          </tr>
          <DataRow label="B.G.B LOW SPEED (CH11)" value={log.bearing_bgb_low_speed_ch11} unit="°C" />
          <DataRow label="B.G.B HIGH SPEED (CH12)" value={log.bearing_bgb_high_speed_ch12} unit="°C" />
          <DataRow label="T.G.B LOW SPEED (CH13)" value={log.bearing_tgb_low_speed_ch13} unit="°C" />
          <DataRow label="T.G.B HIGH SPEED (CH14)" value={log.bearing_tgb_high_speed_ch14} unit="°C" />
        </tbody>
      </table>

      {/* Section 3: Electrical Parameters */}
      <SectionTitle title="3. 3.3 KV GENERATOR - ELECTRICAL PARAMETERS" />
      <table className="w-full mb-4 border">
        <tbody>
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Three-Phase Current
            </td>
          </tr>
          <DataRow label="R Phase Current" value={log.gen_current_r} unit="A" />
          <DataRow label="Y Phase Current" value={log.gen_current_y} unit="A" />
          <DataRow label="B Phase Current" value={log.gen_current_b} unit="A" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Line-to-Line Voltage
            </td>
          </tr>
          <DataRow label="RY Phase Voltage" value={log.gen_voltage_ry} unit="V" />
          <DataRow label="YB Phase Voltage" value={log.gen_voltage_yb} unit="V" />
          <DataRow label="BR Phase Voltage" value={log.gen_voltage_br} unit="V" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Power and Frequency
            </td>
          </tr>
          <DataRow label="KW (Active Power)" value={log.gen_kw} unit="kW" />
          <DataRow label="KVAR (Reactive Power)" value={log.gen_kvar} unit="kVAR" />
          <DataRow label="KVA (Apparent Power)" value={log.gen_kva} unit="kVA" />
          <DataRow label="H.Z. (Frequency)" value={log.gen_frequency} unit="Hz" />
          <DataRow label="PF/COS θ (Power Factor)" value={log.gen_power_factor} />
          <DataRow label="RPM / SPEED" value={log.gen_rpm} unit="RPM" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Energy Consumption
            </td>
          </tr>
          <DataRow label="MWH" value={log.gen_mwh} unit="MWh" />
          <DataRow label="MVARH" value={log.gen_mvarh} unit="MVARh" />
          <DataRow label="MVAH" value={log.gen_mvah} unit="MVAh" />
        </tbody>
      </table>

      {/* Section 4: AVR */}
      <SectionTitle title="4. AVR (AUTOMATIC VOLTAGE REGULATOR)" />
      <table className="w-full mb-4 border">
        <tbody>
          <DataRow label="Field Current" value={log.avr_field_current} unit="A" />
          <DataRow label="Field Voltage" value={log.avr_field_voltage} unit="V" />
        </tbody>
      </table>

      {/* Section 5: Intake System */}
      <SectionTitle title="5. INTAKE SYSTEM" />
      <table className="w-full mb-4 border">
        <tbody>
          <DataRow label="GV% (Guide Vane)" value={log.intake_gv_percentage} unit="%" />
          <DataRow label="RB% (Runner Blade)" value={log.intake_rb_percentage} unit="%" />
          <DataRow label="Water Pressure" value={log.intake_water_pressure} unit="Kg/cm²" />
          <DataRow label="Water Level" value={log.intake_water_level} unit="m" />
        </tbody>
      </table>

      {/* Section 6: Tail Race */}
      <SectionTitle title="6. TAIL RACE" />
      <table className="w-full mb-4 border">
        <tbody>
          <DataRow label="Water Level" value={log.tail_race_water_level} unit="m" />
          <DataRow label="Net Head" value={log.tail_race_net_head} unit="m" />
        </tbody>
      </table>

      {/* Section 7: T.OPU */}
      <SectionTitle title="7. T.OPU (TURBINE OIL PRESSURE UNIT)" />
      <table className="w-full mb-4 border">
        <tbody>
          <DataRow label="Oil Pressure" value={log.topu_oil_pressure} unit="Kg/cm²" />
          <DataRow label="Oil Temperature" value={log.topu_oil_temperature} unit="°C" />
          <DataRow label="Oil Level" value={log.topu_oil_level} unit="%" />
        </tbody>
      </table>

      {/* Section 8: GB.LOS & Cooling Water */}
      <SectionTitle title="8. GB.LOS & COOLING WATER SYSTEM" />
      <table className="w-full mb-4 border">
        <tbody>
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              GB.LOS (Gearbox Lubrication Oil System)
            </td>
          </tr>
          <DataRow label="Oil Pressure" value={log.gblos_oil_pressure} unit="Kg/cm²" />
          <DataRow label="Oil Temperature" value={log.gblos_oil_temperature} unit="°C" />
          <DataRow label="Oil Level" value={log.gblos_oil_level} unit="%" />
          
          <tr className="bg-gray-100">
            <td colSpan={2} className="py-2 px-4 font-semibold">
              Cooling Water System
            </td>
          </tr>
          <DataRow label="Main Pressure" value={log.cooling_main_pressure} unit="Kg/cm²" />
          <DataRow label="LOS Flow" value={log.cooling_los_flow} unit="LPM" />
          <DataRow label="Bearing Flow" value={log.cooling_bearing_flow} unit="Kg/cm²" />
        </tbody>
      </table>

      {/* Remarks */}
      {log.remarks && (
        <>
          <SectionTitle title="REMARKS" />
          <div className="p-4 border rounded bg-gray-50 mb-4">
            <p className="whitespace-pre-wrap">{log.remarks}</p>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-sm text-gray-600">
        <div className="flex justify-between">
          <div>
            <p>
              <span className="font-medium">Logged At:</span>{' '}
              {format(new Date(log.logged_at), 'dd-MM-yyyy HH:mm:ss')}
            </p>
          </div>
          <div>
            <p>
              <span className="font-medium">Report Generated:</span>{' '}
              {format(new Date(), 'dd-MM-yyyy HH:mm:ss')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
