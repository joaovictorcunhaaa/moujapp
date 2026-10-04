import React from 'react';

export type InjectionSite = 'abdomen_left' | 'abdomen_right' | 'thigh_left' | 'thigh_right' | 'arm_left' | 'arm_right';

interface InjectionSitePickerProps {
  value?: InjectionSite;
  onChange: (site: InjectionSite) => void;
  className?: string;
}

const siteLabel: Record<InjectionSite, string> = {
  abdomen_left: 'Abdômen esquerdo',
  abdomen_right: 'Abdômen direito',
  thigh_left: 'Coxa esquerda',
  thigh_right: 'Coxa direita',
  arm_left: 'Braço esquerdo',
  arm_right: 'Braço direito',
};

export const InjectionSitePicker: React.FC<InjectionSitePickerProps> = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <div className="text-sm text-muted-foreground mb-2">Clique na imagem para escolher o local.</div>
      <div className="relative w-full rounded-xl overflow-hidden bg-muted">
        {/* Aspect ratio aproximado da imagem fornecida */}
        <div className="relative w-full" style={{ paddingTop: '74%' }}>
          <img
            src="/aplicar.webp"
            alt="Locais de aplicação: abdômen, coxas e braços"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          {/* Abdômen esquerdo (frente) */}
          <button
            aria-label="Selecionar Abdômen esquerdo"
            onClick={() => onChange('abdomen_left')}
            className={`absolute rounded-full transition-colors ${
              value === 'abdomen_left' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '49%',
              left: '22%',
              width: '6%',
              height: '6%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Abdômen direito (frente) */}
          <button
            aria-label="Selecionar Abdômen direito"
            onClick={() => onChange('abdomen_right')}
            className={`absolute rounded-full transition-colors ${
              value === 'abdomen_right' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '49%',
              left: '32%',
              width: '6%',
              height: '6%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Coxa esquerda (frente) */}
          <button
            aria-label="Selecionar Coxa esquerda"
            onClick={() => onChange('thigh_left')}
            className={`absolute rounded-full transition-colors ${
              value === 'thigh_left' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '78%',
              left: '20%',
              width: '10%',
              height: '22%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Coxa direita (frente) */}
          <button
            aria-label="Selecionar Coxa direita"
            onClick={() => onChange('thigh_right')}
            className={`absolute rounded-full transition-colors ${
              value === 'thigh_right' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '78%',
              left: '34%',
              width: '10%',
              height: '22%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Braço esquerdo (costas) */}
          <button
            aria-label="Selecionar Braço esquerdo"
            onClick={() => onChange('arm_left')}
            className={`absolute rounded-full transition-colors ${
              value === 'arm_left' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '24%',
              left: '58%',
              width: '8%',
              height: '14%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Braço direito (costas) */}
          <button
            aria-label="Selecionar Braço direito"
            onClick={() => onChange('arm_right')}
            className={`absolute rounded-full transition-colors ${
              value === 'arm_right' ? 'ring-2 ring-primary bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
            }`}
            style={{
              top: '24%',
              left: '89%',
              width: '8%',
              height: '14%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>

      {value && (
        <div className="mt-2 text-sm">
          Local selecionado: <span className="font-medium">{siteLabel[value]}</span>
        </div>
      )}
    </div>
  );
};

export default InjectionSitePicker;