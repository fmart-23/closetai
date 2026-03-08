# TensorFlow Lite Model Setup

ClosetAI uses on-device AI for clothing classification. The app is designed to work with a **MobileNet-based clothing classifier** fine-tuned on fashion datasets.

## Current Status

The app currently uses a **smart manual fallback** for classification:
- Users are prompted to select clothing attributes manually
- The UI is pre-filled with common defaults to speed up the process
- All classification is 100% offline

## Adding a Real TF Model (Optional)

To enable true AI classification, you can integrate a pre-trained clothing model:

### Option 1: TensorFlow.js MobileNet (Browser/RN)

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

Then update `src/services/classifier.js` to load and run inference:

```js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

await tf.ready();
const model = await mobilenet.load();
const predictions = await model.classify(imageTensor);
```

### Option 2: Custom Fashion Model

You can use a model fine-tuned on fashion/clothing datasets:

1. **DeepFashion dataset**: A large-scale fashion database with 289,222 diverse clothing images
2. **iMaterialist (Fashion)**: Kaggle competition dataset for fine-grained clothing attribute recognition

### Model Files Location

Place `.tflite` or `.json` model files in this `models/` directory:

```
models/
├── clothing_classifier.tflite    # TFLite model for React Native
├── clothing_classifier.json      # TF.js model (JSON format)
├── clothing_classifier_weights.bin  # Model weights
└── labels.txt                    # Class labels
```

### Loading the Model in the App

Update `src/services/classifier.js`:

```js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const modelJSON = require('../../models/clothing_classifier.json');
const modelWeights = require('../../models/clothing_classifier_weights.bin');

const model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights));
```

## Resources

- [TensorFlow.js React Native](https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native)
- [DeepFashion Dataset](http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html)
- [Fashion MNIST](https://github.com/zalandoresearch/fashion-mnist)
- [Kaggle iMaterialist Fashion](https://www.kaggle.com/c/imaterialist-fashion-2019-FGVC6)
