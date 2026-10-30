import { Link } from "react-router-dom";

const arch = [
  ["Input", "54 features"],
  ["Dense 1", "256 neurons, ReLU"],
  ["Dropout", "0.2"],
  ["Dense 2", "128 neurons, ReLU"],
  ["Dropout", "0.2"],
  ["Dense 3", "64 neurons, ReLU"],
  ["Output", "7 neurons, Softmax"],
];

const featureRows = [
  ["Elevation, aspect, slope", "3"],
  ["Distance to water (horizontal and vertical)", "2"],
  ["Distance to roadways", "1"],
  ["Hillshade at 9 am, noon, 3 pm", "3"],
  ["Distance to fire ignition points", "1"],
  ["Wilderness area indicators", "4"],
  ["Soil type indicators", "40"],
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">About the model</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-forest-800">
          A fully connected neural network trained to predict one of seven forest cover types from cartographic data.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Test accuracy", "about 92.87%"],
          ["Macro F1-score", "about 89.45%"],
          ["Input / output", "54 features / 7 classes"],
        ].map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-sm text-sage-500">{k}</p>
            <p className="font-serif text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </section>
      <p className="text-sm text-sage-500">
        Measured on a held-out test set of 87,152 observations. These figures describe overall performance, not the
        correctness of an individual prediction.
      </p>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Network architecture</h2>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-sage-100">
              {arch.map(([l, c], i) => (
                <tr key={i}>
                  <th scope="row" className="py-2 pr-4 text-left font-medium">{l}</th>
                  <td className="py-2 text-forest-800">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-forest-800">
            Trained with the Adam optimizer, sparse categorical cross-entropy, batch size 256, early stopping and learning-rate reduction on plateau.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold">Dataset</h2>
          <p className="mt-3 text-sm leading-relaxed text-forest-800">
            The Forest Cover Type dataset has about 581,000 observations. It was split with stratified sampling into
            70% training, 15% validation and 15% test data.
          </p>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-sage-100">
              {featureRows.map(([l, n]) => (
                <tr key={l}>
                  <td className="py-2 pr-4">{l}</td>
                  <td className="py-2 text-right font-medium">{n}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-4 font-semibold">Total input features</td>
                <td className="py-2 text-right font-semibold">54</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Preprocessing and prediction workflow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-forest-800">
          <li>The form sends the 54 original, unscaled values to the API.</li>
          <li>The backend checks that every feature is present and valid, then orders them exactly as in training.</li>
          <li>The saved StandardScaler is applied to the 10 continuous features only. The 44 binary features are left unchanged.</li>
          <li>The neural network outputs seven probabilities, indexed 0 to 6.</li>
          <li>The highest probability is selected, and its index is converted back to the original label (1 to 7) by adding 1.</li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-forest-800">
          All preprocessing runs in Python on the server. The browser never scales or alters your inputs.
        </p>
        <Link to="/predict" className="btn-primary mt-6">Try a prediction</Link>
      </section>
    </div>
  );
}
